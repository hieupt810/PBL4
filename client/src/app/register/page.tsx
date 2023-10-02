"use client";
import Button from "@/component/Button";
import Popup from "@/component/Popup";
import TranslateCode from "@/language/translate";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { TbSmartHome } from "react-icons/tb";
import "./register.css";

interface FieldProps {
  text: string;
  error: boolean;
}

interface PopupProps {
  type?: "success" | "failed";
  text: string;
}

export default function Register() {
  const router = useRouter();

  const [loading, setLoading] = useState<boolean>(false);
  const [popup, setPopup] = useState<PopupProps>({ text: "" });
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
  const [password, setPassword] = useState<FieldProps>({
    text: "",
    error: false,
  });
  const [retype, setRetype] = useState<FieldProps>({
    text: "",
    error: false,
  });

  const handleRadio = (e: any) => {
    const target = e.target;
    if (target.checked) {
      setGender(target.value);
    }
  };

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
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
        first_name: firstname.text,
        last_name: lastname.text,
        gender: gender,
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
          router.push("/login");
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
          <h5>Đăng ký tài khoản</h5>
        </div>

        <form onSubmit={handleRegister}>
          <div className="field__container">
            <div className="form__field">
              <label className="field__label">
                <p>Tên người dùng</p>
                <span>*</span>
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
                <span>*</span>
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

            <div className="form__field">
              <label className="field__label">
                <p>Nhập lại mật khẩu</p>
                <span>*</span>
              </label>
              <input
                type="password"
                value={retype.text}
                className={retype.error ? "field_error" : ""}
                onChange={(e) =>
                  setRetype({ text: e.target.value, error: false })
                }
              />
            </div>
          </div>

          <div className="form__button">
            <Button text="Đăng ký" type="submit" loading={loading} />
          </div>
        </form>

        <div className="href">
          <span>Đã có tài khoản?</span>
          <a href="/login">Đăng nhập</a>
        </div>
      </main>
    </div>
  );
}
