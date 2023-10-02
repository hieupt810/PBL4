"use client";
import Button from "@/component/Button";
import Popup from "@/component/Popup";
import TranslateCode from "@/language/translate";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import "./profile.css";

interface PopupProps {
  type?: "success" | "failed";
  text: string;
}

interface FieldProps {
  text: string;
  error: boolean;
}

export default function Profile() {
  const router = useRouter();
  const [popup, setPopup] = useState<PopupProps>({ text: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const [firstname, setFirstname] = useState<FieldProps>({
    text: "",
    error: false,
  });
  const [lastname, setLastname] = useState<FieldProps>({
    text: "",
    error: false,
  });
  const [gender, setGender] = useState<number>(0);
  const [username, setUsername] = useState<FieldProps>({
    text: "",
    error: false,
  });

  useEffect(() => {
    const token = getCookie("token") as string;

    if (!token) {
      router.push("/login");
      return;
    }
    fetch(process.env.BACKEND_URL + `/api/auth?token=${token}`, {
      method: "GET",
    })
      .then((r) => {
        if (!r.ok)
          setPopup({ text: TranslateCode("VI", "E001"), type: "failed" });
        return r.json();
      })
      .then((d) => {
        if (d.status == 200) {
          setUsername({ text: d.profile["username"], error: false });
          setFirstname({ text: d.profile["first_name"], error: false });
          setLastname({ text: d.profile["last_name"], error: false });
          setGender(d.profile["gender"]);
        } else router.push("/");
      });
  }, [router]);

  const handleRadio = (e: any) => {
    const target = e.target;
    if (target.checked) {
      setGender(target.value);
    }
  };

  const handleUpdateUser = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (firstname.text.trim() === "") {
      setFirstname({ text: firstname.text.trim(), error: true });
      setLoading(false);
      return;
    }

    if (lastname.text.trim() === "") {
      setLastname({ text: lastname.text.trim(), error: true });
      setLoading(false);
      return;
    }

    if (username.text.trim() === "") {
      setUsername({ text: username.text.trim(), error: true });
      setLoading(false);
      return;
    }

    const headers: Headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    headers.append("token", getCookie("token") as string);
    fetch(process.env.BACKEND_URL + "/api/auth", {
      method: "PUT",
      headers: headers,
      body: JSON.stringify({
        username: username.text,
        first_name: firstname.text,
        last_name: lastname.text,
        gender: gender,
      }),
    })
      .then((r) => {
        if (!r.ok)
          setPopup({ text: TranslateCode("VI", "E001"), type: "failed" });
        return r.json();
      })
      .then((d) => {
        setLoading(false);
        if (d.status == 200) {
          setPopup({ text: TranslateCode("VI", d.message), type: "success" });
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

      <main>
        <h5>Thông tin tài khoản</h5>
        <form onSubmit={handleUpdateUser}>
          <div className="field__container">
            <div className="form__field">
              <label className="field__label">
                <p>Tên đăng nhập</p>
              </label>
              <input
                type="text"
                value={username.text}
                className={username.error ? "field_error" : ""}
                onChange={(e) =>
                  setUsername({ text: e.target.value, error: false })
                }
                disabled
              />
            </div>

            <div className="form__field">
              <label className="field__label">
                <p>Tên người dùng</p>
              </label>
              <div className="field_two">
                <input
                  type="text"
                  value={firstname.text}
                  className={firstname.error ? "field_error" : ""}
                  onChange={(e) =>
                    setFirstname({ text: e.target.value, error: false })
                  }
                  placeholder="Tên"
                />

                <input
                  type="text"
                  value={lastname.text}
                  className={lastname.error ? "field_error" : ""}
                  onChange={(e) =>
                    setLastname({ text: e.target.value, error: false })
                  }
                  placeholder="Họ"
                />
              </div>
            </div>

            <div className="field_radio">
              <label className="field__label">
                <p>Giới tính</p>
              </label>

              <div className="radio_container">
                <label>
                  <input
                    type="radio"
                    value={0}
                    checked={gender == 0}
                    onChange={handleRadio}
                  />
                  <span>Nam</span>
                </label>

                <label>
                  <input
                    type="radio"
                    value={1}
                    checked={gender == 1}
                    onChange={handleRadio}
                  />
                  <span>Nữ</span>
                </label>
              </div>
            </div>
          </div>

          <div className="form__button">
            <Button text="Cập nhật" type="submit" loading={loading} />
          </div>
        </form>
      </main>
    </div>
  );
}
