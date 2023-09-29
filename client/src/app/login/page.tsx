"use client";
import Button from "@/components/Button";
import Popup from "@/components/Popup";
import TranslateCode from "@/language/translate";
import { setCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { TbSmartHome } from "react-icons/tb";
import styles from "./login.module.css";

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

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
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
          router.push("/");
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

      <main className={styles.main}>
        <div className={styles.title_container}>
          <div>
            <TbSmartHome color={"#1f75fe"} size={100} />
          </div>
          <h5 className={styles.title}>Đăng nhập</h5>
        </div>

        <div className={styles.form_container}>
          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.field_container}>
              <div className={styles.input_field}>
                <label>
                  <p>Tên đăng nhập</p>
                  <span>*</span>
                </label>
                <input
                  type="text"
                  value={username.text}
                  className={username.error ? styles.field_error : ""}
                  onChange={(e) =>
                    setUsername({ text: e.target.value, error: false })
                  }
                />
              </div>

              <div className={styles.input_field}>
                <label>
                  <p>Mật khẩu</p>
                  <span>*</span>
                </label>
                <input
                  type="password"
                  value={password.text}
                  className={password.error ? styles.field_error : ""}
                  onChange={(e) =>
                    setPassword({ text: e.target.value, error: false })
                  }
                />
              </div>
            </div>

            <Button text="Đăng nhập" type="submit" loading={loading} />
          </form>
        </div>

        <div className={styles.href}>
          <span>Chưa có tài khoản?</span>
          <a href="/register">Đăng ký</a>
        </div>
      </main>
    </div>
  );
}
