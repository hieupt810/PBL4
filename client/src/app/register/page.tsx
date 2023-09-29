"use client";

import Button from "@/components/Button";
import Popup from "@/components/Popup";
import { FormEvent, useState } from "react";
import { TbSmartHome } from "react-icons/tb";
import styles from "./register.module.css";

interface FieldProps {
  text: string;
  error: boolean;
}

export default function Register() {
  const [loading, setLoading] = useState<boolean>(false);
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

    if (password !== retype) {
      setPassword({ text: password.text, error: true });
      setRetype({ text: retype.text, error: true });
      setLoading(false);
      return;
    }

    const headers: Headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    fetch("http://127.0.0.1:8082/api/auth/register", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        name: fullname,
        username: username,
        password: password,
      }),
    })
      .then((r) => {
        if (!r.ok) console.error(r.status);
        return r.json();
      })
      .then((d) => {
        if (d.status == 200) {
          console.log("Success");
        } else {
          console.log("Failed");
        }
        setLoading(false);
      });
  };

  return (
    <div>
      <Popup type={"failed"} text={"Đăng nhập thất bại"} close={() => {}} />

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
