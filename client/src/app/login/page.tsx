"use client";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch } from "@/hook/hook";
import { InputProps } from "@/models/frontend/inputField";
import { Button } from "@nextui-org/react";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { TbSmartHome } from "react-icons/tb";
import MobileLayout from "../mobile";
import "./styles.css";

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [username, setUsername] = useState<InputProps>({
    text: "",
    error: false,
  });
  const [password, setPassword] = useState<InputProps>({
    text: "",
    error: false,
  });

  const handleLogin = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    if (username.text.trim() === "") {
      setUsername({ text: username.text.trim(), error: true });
      setLoading(false);
      return;
    }
    if (password.text === "") {
      setPassword({ text: password.text, error: true });
      setLoading(false);
      return;
    }

    const headers: Headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    fetch(process.env.BACKEND_URL + "api/auth/login", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        username: username.text,
        password: password.text,
      }),
    })
      .then((r) => r.json())
      .then((d) => {
        setLoading(false);
        if (d.status == 200) {
          dispatch(successPopUp(d.message));
          setCookie("token", d.token, { maxAge: 60 * 60 * 24 * 7 });
          router.push("/home");
        } else dispatch(failPopUp(d.message));
      });
  };

  return (
    <MobileLayout>
      <div className="logo">
        <div>
          <TbSmartHome color={"#1f75fe"} size={100} />
        </div>

        <h5>Đăng nhập</h5>
      </div>

      <form onSubmit={handleLogin}>
        <div className="form__field">
          <div className="form__input">
            <label>
              <p>Tên đăng nhập</p>
              <span>*</span>
            </label>

            <input
              type="text"
              value={username.text}
              className={username.error ? "input__error" : ""}
              onChange={(e) =>
                setUsername({ text: e.target.value, error: false })
              }
            />
          </div>

          <div className="form__input">
            <label>
              <p>Mật khẩu</p>
              <span>*</span>
            </label>

            <input
              type="password"
              value={password.text}
              className={password.error ? "input__error" : ""}
              onChange={(e) =>
                setPassword({ text: e.target.value, error: false })
              }
            />
          </div>
        </div>

        <div className="form__button">
          <Button color="primary" isLoading={loading} type="submit">
            Đăng nhập
          </Button>
        </div>
      </form>

      <div className="href">
        <span>Chưa có tài khoản?</span>
        <a href="/register">Đăng ký</a>
      </div>
    </MobileLayout>
  );
}
