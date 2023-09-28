"use client";

import Button from "@/components/Button";
import { FormEvent, useState } from "react";
import { TbSmartHome } from "react-icons/tb";
import styles from "./Register.module.css";

export default function Register() {
  const [loading, setLoading] = useState<boolean>(false);
  const [fullname, setFullname] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [retype, setRetype] = useState<string>("");

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (password !== retype) {
      console.log("Different");
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
              <label>Họ và tên</label>
              <input
                type="text"
                value={fullname}
                onChange={(e) => setFullname(e.target.value)}
              />
            </div>

            <div className={styles.input_field}>
              <label>Tên đăng nhập</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            <div className={styles.input_field}>
              <label>Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div className={styles.input_field}>
              <label>Nhập lại mật khẩu</label>
              <input
                type="password"
                value={retype}
                onChange={(e) => setRetype(e.target.value)}
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
  );
}
