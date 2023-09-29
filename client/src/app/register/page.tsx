"use client";
import Button from "@/components/Button";
import Popup from "@/components/Popup";
import TranslateCode from "@/language/translate";
import { FormEvent, useState } from "react";
import { TbSmartHome } from "react-icons/tb";
import styles from "./register.module.css";

interface FieldProps {
  text: string;
  error: boolean;
}

interface PopupProps {
  type?: "success" | "failed";
  text: string;
}

export default function Register() {
  const [loading, setLoading] = useState<boolean>(false);
  const [popup, setPopup] = useState<PopupProps>({ text: "" });
  const [fullname, setFullname] = useState<FieldProps>({
    text: "",
    error: false,
  });
  const [username, setUsername] = useState<FieldProps>({
    text: "",
    error: false,
  });
  const [password, setPassword] = useState<FieldProps>({
    text: "",
    error: false,
  });
  const [retype, setRetype] = useState<FieldProps>({
    text: "",
    error: false,
  });

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (fullname.text.trim() === "") {
      setFullname({ text: fullname.text.trim(), error: true });
      setLoading(false);
      return;
    }

    if (username.text.trim() === "") {
      setUsername({ text: username.text.trim(), error: true });
      setLoading(false);
      return;
    }

    if (
      password.text === "" ||
      retype.text === "" ||
      password.text !== retype.text
    ) {
      setPassword({ text: password.text, error: true });
      setRetype({ text: retype.text, error: true });
      setLoading(false);
      return;
    }

    const headers: Headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    fetch(process.env.BACKEND_URL + "/api/auth/register", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        fullname: fullname.text,
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
        if (d.status == 200)
          setPopup({ text: TranslateCode("VI", d.message), type: "success" });
        else setPopup({ text: TranslateCode("VI", d.message), type: "failed" });
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
          <h5 className={styles.title}>Đăng ký tài khoản</h5>
        </div>

        <div className={styles.form_container}>
          <form onSubmit={handleRegister} className={styles.form}>
            <div className={styles.field_container}>
              <div className={styles.input_field}>
                <label>
                  <p>Họ và tên</p>
                  <span>*</span>
                </label>
                <input
                  type="text"
                  value={fullname.text}
                  className={fullname.error ? styles.field_error : ""}
                  onChange={(e) =>
                    setFullname({ text: e.target.value, error: false })
                  }
                />
              </div>

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

              <div className={styles.input_field}>
                <label>
                  <p>Nhập lại mật khẩu</p>
                  <span>*</span>
                </label>
                <input
                  type="password"
                  value={retype.text}
                  className={retype.error ? styles.field_error : ""}
                  onChange={(e) =>
                    setRetype({ text: e.target.value, error: false })
                  }
                />
              </div>
            </div>

            <Button text="Đăng ký" type="submit" loading={loading} />
          </form>
        </div>

        <div className={styles.href}>
          <span>Đã có tài khoản?</span>
          <a href="/login">Đăng nhập</a>
        </div>
      </main>
    </div>
  );
}
