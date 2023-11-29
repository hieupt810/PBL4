"use client";
import { resetLoading, setLoading } from "@/hook/features/LoadingSlice";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch, useAppSelector } from "@/hook/hook";
import { Button, Input, Radio, RadioGroup } from "@nextui-org/react";
import { getCookie, hasCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import MobileLayout from "../mobile";
import http from "../utils/http";

export default function Profile() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.loadingReducer.onLoading);

  const [username, setUsername] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [gender, setGender] = useState("");
  const [role, setRole] = useState(0);

  useEffect(() => {
    async function fetchUser() {
      if (!hasCookie("token")) {
        router.push("/login");
        return;
      }

      const token = getCookie("token")?.toString();
      try {
        const response = await http.get("api/user");
        const data = await response.data;

        if (data.status === 200) {
          setUsername(data.profile["username"]);
          setFirstname(data.profile["first_name"]);
          setLastname(data.profile["last_name"]);
          setGender(data.profile["gender"].toString());
          setRole(data.profile["role"]);
        } else {
          router.push("/");
        }
      } catch (error) {
        console.error("Error:", error);
      }
    }
    fetchUser();
  }, [router]);

  const handleUpdateUser = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(setLoading());

    const userData = {
      username: username,
      first_name: firstname,
      last_name: lastname,
      gender: parseInt(gender),
      role: role,
    };
    if (!hasCookie("token")) {
      router.push("/login");
      return;
    }

    const token = getCookie("token")?.toString();

    try {
      const response = await http.put("api/user", userData, {
        headers: {
          Authorization: `${token}`,
        },
      });

      const data = await response.data;
      if (data.status === 200) {
        dispatch(successPopUp(data.message));
        router.push("/home");
      } else {
        dispatch(failPopUp(data.message));
        dispatch(resetLoading());
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <MobileLayout>
      <h5 className="text-primary font-semibold text-xl text-center">
        Thông tin tài khoản
      </h5>

      <form onSubmit={handleUpdateUser}>
        <div className="space-y-4">
          <Input
            size="md"
            isRequired
            isDisabled
            color="primary"
            value={username}
            label="Tên đăng nhập"
            classNames={{
              input: "text-black/90",
              inputWrapper: "bg-white",
            }}
          />

          <div className="flex flex-row items-center justify-start space-x-1">
            <Input
              size="md"
              isRequired
              color="primary"
              value={firstname}
              label="Tên"
              onChange={(e) => setFirstname(e.target.value)}
              classNames={{
                input: "text-black/90",
                inputWrapper: "bg-white",
              }}
            />

            <Input
              size="md"
              isRequired
              color="primary"
              value={lastname}
              label="Họ"
              onChange={(e) => setLastname(e.target.value)}
              classNames={{
                input: "text-black/90",
                inputWrapper: "bg-white",
              }}
            />
          </div>

          <RadioGroup
            isRequired
            value={gender}
            className="px-1"
            label="Giới tính"
            orientation="horizontal"
            onValueChange={setGender}
          >
            <Radio value="0">Nam</Radio>
            <Radio value="1">Nữ</Radio>
          </RadioGroup>
        </div>

        <div className="flex items-center justify-center my-8">
          <Button type="submit" isLoading={loading} color="primary">
            Cập nhật
          </Button>
        </div>
      </form>
    </MobileLayout>
  );
}
