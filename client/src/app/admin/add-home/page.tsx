"use client";
import { Users } from "@/app/types/users.type";
import http from "@/app/utils/http";
import useDebounce from "@/hook/custoom/useDebounce";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { getUserList } from "@/hook/features/SearchSlice";
import { RootState, useAppDispatch } from "@/hook/store";
import { Button, Input } from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { TbHomePlus } from "react-icons/tb";
import { useSelector } from "react-redux";
import Select from "react-select";
import AdminLayout from "../layout";
import EyeFilledIcon from "./icon_eye/EyeFilledIcon";
import EyeSlashFilledIcon from "./icon_eye/EyeSlashFilledIcon";

interface OptionType {
  value: string;
  label: string;
}

type SelectChangeValueType = OptionType | null;

export default function AddHome() {
  const rawUserList: Users[] = useSelector(
    (state: RootState) => state.search.userList
  );
  const [selectedOption, setSelectedOption] =
    useState<SelectChangeValueType | null>(null);
  const userList = Array.isArray(rawUserList) ? rawUserList : [];
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [searchValue, setSearchValue] = useState("");
  const debouncedSearchValue = useDebounce(searchValue, 500);
  const [password, setPassword] = useState("");

  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  useEffect(() => {
    if (debouncedSearchValue) {
      const promise = dispatch(getUserList());
      return () => {
        promise.abort();
      };
    }
  }, [debouncedSearchValue, dispatch]);

  const selectOptions = userList.map((user) => ({
    value: user.username || "",
    label: user.username || "",
  }));

  const NoDropdownIndicator = () => null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
  };

  const handleButton = async () => {
    if (selectedOption && password != "") {
      const data = {
        username: selectedOption.value,
        password,
      };
      try {
        const response = await http.post("api/home", data, {
          headers: {
            token: `${getCookie("token")?.toString()}`,
          },
        });
        const result = await response.data;
        if (result.code == 200) {
          dispatch(successPopUp(result.message));
        } else if (result.code != 200) {
          dispatch(failPopUp(result.message));
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      dispatch(failPopUp("E005"));
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-lg drop-shadow-2xl w-1/3">
          <div className="mb-4">
            <div className="flex flex-col justify-center items-center gap-1 font-bold h-[desiredHeight] text-lg mb-2.5">
              <TbHomePlus className="text-2xl" />
              Thêm nhà
            </div>
          </div>
          <div className="mb-4">
            <label
              id="ownerNameLabel"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Tên chủ nhà:
            </label>
            <Select
              options={selectOptions}
              placeholder="Địa chỉ email hoặc tên"
              onChange={(option) =>
                setSelectedOption(option as SelectChangeValueType)
              }
              value={selectedOption}
              isSearchable={true}
              instanceId="unique-select-id"
              onInputChange={(value) => setSearchValue(value)}
              components={{
                DropdownIndicator: NoDropdownIndicator,
              }}
            />
          </div>
          <div className="mb-4">
            <label
              id="ownerNameLabel"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Mật khẩu:
            </label>
            <Input
              variant="bordered"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                handleInputChange;
                const sanitizedValue = e.target.value.replace(/[^1-9]/g, "");
                const truncatedValue = sanitizedValue.slice(0, 5);
                setPassword(truncatedValue);
              }}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                >
                  {isVisible ? (
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  )}
                </button>
              }
              type={isVisible ? "text" : "password"}
              pattern="[1-9]{1,5}"
              maxLength={5}
            />
          </div>
          <div className="flex justify-around">
            <Button
              color="danger"
              variant="flat"
              onClick={() => router.push("/admin")}
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={() => {
                handleButton();
                router.push("/admin");
              }}
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
