"use client";
import Button from "@/component/Button";
import Popup from "@/component/Popup";
import TranslateCode from "@/language/translate";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { TbSmartHome } from "react-icons/tb";
import "./login.css";

interface FieldProps {
  text: string;
  error: boolean;
}

interface PopupProps {
  type?: "success" | "failed";
  text: string;
}

export default function Login() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [popup, setPopup] = useState<PopupProps>({ text: "" });
  const [username, setUsername] = useState<FieldProps>({
    text: "",
    error: false,
  });
  const [password, setPassword] = useState<FieldProps>({
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
    fetch(process.env.BACKEND_URL + "/api/auth/login", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        username: username.text,
        password: password.text,
      }),
    })
      .then((r) => {
        setLoading(false);
        if (!r.ok)
          setPopup({ text: TranslateCode("VI", "E001"), type: "failed" });
        return r.json();
      })
      .then((d) => {
        if (d.status == 200) {
          setPopup({ text: TranslateCode("VI", d.message), type: "success" });
          setCookie("token", d.token, { maxAge: 60 * 60 * 24 * 7 });
          router.push("/home");
        } else
          setPopup({ text: TranslateCode("VI", d.message), type: "failed" });
      });
  };

  return (
    <div>
      <Popup
        type={popup.type}
        text={popup.text}
        close={() => {
          setPopup({ text: "", type: undefined });
        }}
      />

      <main className="!justify-between !items-center">
        <div className="title">
          <div>
            <TbSmartHome color={"#1f75fe"} size={100} />
          </div>
          <h5>Đăng nhập</h5>
        </div>

        <form onSubmit={handleLogin} className="w-full">
          <div className="field__container">
            <div className="form__field">
              <label className="field__label">
                <p>Tên đăng nhập</p>
                <span>*</span>
              </label>
              <input
                type="text"
                value={username.text}
                className={username.error ? "field_error" : ""}
                onChange={(e) =>
                  setUsername({ text: e.target.value, error: false })
                }
              />
            </div>

            <div className="form__field">
              <label className="field__label">
                <p>Mật khẩu</p>
                <span>*</span>
              </label>
              <input
                type="password"
                value={password.text}
                className={password.error ? "field_error" : ""}
                onChange={(e) =>
                  setPassword({ text: e.target.value, error: false })
                }
              />
            </div>
          </div>

          <div className="form__button">
            <Button text="Đăng nhập" type="submit" loading={loading} />
          </div>
        </form>

        <div className="href">
          <span>Chưa có tài khoản?</span>
          <a href="/register">Đăng ký</a>
        </div>
      </main>
    </div>
  );
}
