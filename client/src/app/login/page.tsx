"use client";
import { resetLoading, setLoading } from "@/hook/features/LoadingSlice";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch, useAppSelector } from "@/hook/hook";
import { Button, Input, Link } from "@nextui-org/react";
import { hasCookie, setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { TbSmartHome } from "react-icons/tb";
import MobileLayout from "../mobile";

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const loading = useAppSelector((state) => state.loadingReducer.onLoading);
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  useEffect(() => {
    if (hasCookie("token")) {
      router.push("/home");
      return;
    }
  }, [router]);

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(setLoading());

    const headers: Headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    fetch(process.env.BACKEND_URL + "api/auth/login", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        username: username,
        password: password,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.status == 200) {
          dispatch(successPopUp(d.message));
          setCookie("token", d.token, { maxAge: 60 * 60 * 24 * 7 });
          if (d.role == 2) router.push("/admin");
          else router.push("/home");
        } else {
          dispatch(failPopUp(d.message));
          dispatch(resetLoading());
        }
      });
  };

  return (
    <MobileLayout>
      <div className="flex flex-col items-center justify-center space-y-2">
        <TbSmartHome color={"#1f75fe"} size={100} />
        <h5 className="text-primary font-semibold text-xl">Đăng nhập</h5>
      </div>

      <form onSubmit={handleLogin}>
        <div className="space-y-4">
          <Input
            size="md"
            isRequired
            color="primary"
            value={username}
            label="Tên đăng nhập"
            onChange={(e) => setUsername(e.target.value)}
            classNames={{
              input: "text-black/90",
              inputWrapper: "bg-white",
            }}
          />

          <Input
            size="md"
            isRequired
            type="password"
            label="Mật khẩu"
            value={password}
            color={"primary"}
            onChange={(e) => setPassword(e.target.value)}
            classNames={{
              input: "text-black/90",
              inputWrapper: "bg-white",
            }}
          />
        </div>

        <div className="flex items-center justify-center my-8">
          <Button type="submit" isLoading={loading} color="primary">
            Đăng nhập
          </Button>
        </div>
      </form>

      <div className="flex flex-row items-center justify-center space-x-1 border-t border-gray-200 py-4">
        <span>Chưa có tài khoản?</span>
        <Link href="/register">Đăng ký</Link>
      </div>
    </MobileLayout>
  );
}
