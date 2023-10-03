"use client";
import { resetLoading, setLoading } from "@/hook/features/LoadingSlice";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch, useAppSelector } from "@/hook/hook";
import { Button, Input, Radio, RadioGroup } from "@nextui-org/react";
import { getCookie, hasCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import MobileLayout from "../mobile";

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
    if (!hasCookie("token")) {
      router.push("/login");
      return;
    }
    const token = getCookie("token")?.toString();
    fetch(process.env.BACKEND_URL + `api/user?token=${token}`, {
      method: "GET",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.status == 200) {
          setUsername(d.profile["username"]);
          setFirstname(d.profile["first_name"]);
          setLastname(d.profile["last_name"]);
          setGender(d.profile["gender"].toString());
          setRole(d.profile["role"]);
        } else router.push("/");
      });
  }, [dispatch, router]);

  const handleUpdateUser = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(setLoading());

    const headers: Headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    headers.append("token", getCookie("token") as string);
    fetch(process.env.BACKEND_URL + "api/user", {
      method: "PUT",
      headers: headers,
      body: JSON.stringify({
        username: username,
        first_name: firstname,
        last_name: lastname,
        gender: parseInt(gender),
        role: role,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.status == 200) {
          dispatch(successPopUp(d.message));
          router.push("/home");
        } else {
          dispatch(failPopUp(d.message));
          dispatch(resetLoading());
        }
      });
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
