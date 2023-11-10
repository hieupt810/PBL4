"use client";
import { resetLoading, setLoading } from "@/hook/features/LoadingSlice";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch, useAppSelector } from "@/hook/hook";
import { Button, Input } from "@nextui-org/react";
import { getCookie, hasCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import MobileLayout from "../mobile";
import http from "../utils/http";

export default function Profile() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.loadingReducer.onLoading);

  const [password_old, setPassword_old] = useState("");
  const [password_new, setPassword_new] = useState("");
  const [role, setRole] = useState(1);

  useEffect(() => {
    async function fetchUser() {
      if (!hasCookie("token")) {
        router.push("/login");
        return;
      }

      const token = getCookie("token")?.toString();
      try {
        const response = await http.get(`api/user`, {
          headers: {
            token: `${token}`,
          },
        });
        const data = await response.data;

        if (data.status === 200) {
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

  const handlePassword = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (role === 1) {
      const data = {
        oldPass :password_old,
        newPass :password_new,
      };

      try {
        const response = await http.put("/api/door/resetPass", data, {
          headers: {
            token: `${getCookie("token")?.toString()}`,
          },
        });

        const result = await response.data;
        console.log(result)
        if (result?.status !== 200) {
          dispatch(failPopUp(result.message));
        } else if (result.status == 200) {
          dispatch(successPopUp(result.message));
          dispatch(resetLoading());
        }
      } catch (error) {
        dispatch(failPopUp("E001"));
      }
    } else {
      alert("Tính năng không được hỗ trợ");
    }
  };

  return (
    <MobileLayout>
      <h5 className="text-primary font-semibold text-xl text-center">
        Thay đổi mật khẩu
      </h5>

      <form onSubmit={handlePassword}>
        <div className="space-y-4">
          {role === 1 ? (
            <>
              <Input
                size="md"
                isRequired
                color="primary"
                type="password"
                value={password_old}
                label="Nhập mật khẩu cũ"
                onChange={(e) => {
                  setPassword_old(e.target.value);
                  const sanitizedValue = e.target.value.replace(/[^1-9]/g, "");
                  const truncatedValue = sanitizedValue.slice(0, 5);
                  setPassword_old(truncatedValue);
                }}
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
                  type="password"
                  value={password_new}
                  label="Nhập mật khẩu mới"
                  onChange={(e) => {
                    setPassword_new(e.target.value);
                    const sanitizedValue = e.target.value.replace(
                      /[^1-9]/g,
                      ""
                    );
                    const truncatedValue = sanitizedValue.slice(0, 5);
                    setPassword_new(truncatedValue);
                  }}
                  classNames={{
                    input: "text-black/90",
                    inputWrapper: "bg-white",
                  }}
                />
              </div>

              <div className="flex items-center justify-center my-8">
                <Button type="submit" isLoading={loading} color="primary">
                  Cập nhật
                </Button>
              </div>
            </>
          ) : (
            <div className="text-red-500">Tính năng không được hỗ trợ</div>
          )}
        </div>
      </form>
    </MobileLayout>
  );
}