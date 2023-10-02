"use client";
import Button from "@/components/Button";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch } from "@/hook/hook";
import { InputProps } from "@/models/frontend/inputField";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { TbSmartHome } from "react-icons/tb";
import MobileLayout from "../mobile";
import "./styles.css";

export default function Register() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [firstname, setFirstname] = useState<InputProps>({
    text: "",
    error: false,
  });
  const [lastname, setLastname] = useState<InputProps>({
    text: "",
    error: false,
  });
  const [gender, setGender] = useState<number>(0);
  const [username, setUsername] = useState<InputProps>({
    text: "",
    error: false,
  });
  const [password, setPassword] = useState<InputProps>({
    text: "",
    error: false,
  });
  const [retype, setRetype] = useState<InputProps>({
    text: "",
    error: false,
  });

  const handleRadio = (e: any) => {
    if (e.target.checked) setGender(e.target.value);
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
      .then((r) => r.json())
      .then((d) => {
        setLoading(false);
        if (d.status == 200) {
          dispatch(successPopUp(d.message));
          router.push("/login");
        } else dispatch(failPopUp(d.message));
      });
  };

  return (
    <MobileLayout>
      <div className="logo">
        <div>
          <TbSmartHome color={"#1f75fe"} size={100} />
        </div>

        <h5>Đăng ký tài khoản</h5>
      </div>

      <form onSubmit={handleRegister}>
        <div className="form__field">
          <div className="form__input">
            <label>
              <p>Tên người dùng</p>
              <span>*</span>
            </label>

            <div className="form__doubleInput">
              <input
                type="text"
                value={firstname.text}
                className={firstname.error ? "input__error" : ""}
                onChange={(e) =>
                  setFirstname({ text: e.target.value, error: false })
                }
                placeholder="Tên"
              />

              <input
                type="text"
                value={lastname.text}
                className={lastname.error ? "input__error" : ""}
                onChange={(e) =>
                  setLastname({ text: e.target.value, error: false })
                }
                placeholder="Họ"
              />
            </div>
          </div>

          <div className="form__radio">
            <label>
              <p>Giới tính</p>
              <span>*</span>
            </label>

            <div>
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

          <div className="form__input">
            <label>
              <p>Nhập lại mật khẩu</p>
              <span>*</span>
            </label>

            <input
              type="password"
              value={retype.text}
              className={retype.error ? "input__error" : ""}
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
    </MobileLayout>
  );
}
