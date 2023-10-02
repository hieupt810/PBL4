"use client";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch } from "@/hook/hook";
import { Button, Input, Radio, RadioGroup } from "@nextui-org/react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { TbSmartHome } from "react-icons/tb";
import MobileLayout from "../mobile";

export default function Register() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);
  // Input
  const [firstname, setFirstname] = useState<string>("");
  const [lastname, setLastname] = useState<string>("");
  const [gender, setGender] = useState<string>("0");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [retype, setRetype] = useState<string>("");

  const handleRegister = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if (password !== retype) {
      setError(true);
      return;
    }

    const headers: Headers = new Headers();
    headers.append("Accept", "application/json");
    headers.append("Content-Type", "application/json");
    fetch(process.env.BACKEND_URL + "api/auth/register", {
      method: "POST",
      headers: headers,
      body: JSON.stringify({
        first_name: firstname,
        last_name: lastname,
        gender: gender,
        username: username,
        password: password,
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
      <div className="flex flex-col items-center justify-center space-y-2">
        <TbSmartHome color={"#1f75fe"} size={100} />
        <h5 className="text-primary font-semibold text-xl">
          Đăng ký tài khoản
        </h5>
      </div>

      <form onSubmit={handleRegister}>
        <div className="space-y-4">
          <div className="flex flex-row items-center justify-start space-x-1">
            <Input
              size="md"
              isRequired
              color="primary"
              value={firstname}
              label="Tên"
              onChange={(e) => setFirstname(e.target.value)}
              classNames={{
                input: "text-black/90",
                inputWrapper: "bg-white",
              }}
            />

            <Input
              size="md"
              isRequired
              color="primary"
              value={lastname}
              label="Họ"
              onChange={(e) => setLastname(e.target.value)}
              classNames={{
                input: "text-black/90",
                inputWrapper: "bg-white",
              }}
            />
          </div>

          <RadioGroup
            isRequired
            value={gender}
            label="Giới tính"
            defaultValue="0"
            orientation="horizontal"
            onValueChange={setGender}
            className="px-1"
          >
            <Radio value="0">Nam</Radio>
            <Radio value="1">Nữ</Radio>
          </RadioGroup>

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
            color={error ? "danger" : "primary"}
            onChange={(e) => setPassword(e.target.value)}
            classNames={{
              input: "text-black/90",
              inputWrapper: "bg-white",
            }}
          />

          <Input
            size="md"
            isRequired
            value={retype}
            type="password"
            label="Nhập lại mật khẩu"
            color={error ? "danger" : "primary"}
            onChange={(e) => setRetype(e.target.value)}
            classNames={{
              input: "text-black/90",
              inputWrapper: "bg-white",
            }}
          />
        </div>

        <div className="flex items-center justify-center my-8">
          <Button type="submit" isLoading={loading} color="primary">
            Đăng ký
          </Button>
        </div>
      </form>

      <div className="flex flex-row items-center justify-center space-x-1 border-t border-gray-200 py-4">
        <span>Đã có tài khoản?</span>
        <a href="/login" className="font-semibold text-primary">
          Đăng nhập
        </a>
      </div>
    </MobileLayout>
  );
}
