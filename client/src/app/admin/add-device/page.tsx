"use client";
import Select from "react-select";
import AdminLayout from "../layout";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button } from "@nextui-org/react";
import { TbHomePlus } from "react-icons/tb";
import { getUserList } from "@/hook/features/SearchSlice";
import { RootState, useAppDispatch } from "@/hook/store";
import { useSelector } from "react-redux";
import { Users } from "@/app/types/users.type";
import useDebounce from "@/hook/custoom/useDebounce";
import { Input } from "@nextui-org/react";

import http from "@/app/utils/http";
import { getCookie } from "cookies-next";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import EyeSlashFilledIcon from "../add-home/icon_eye/EyeSlashFilledIcon";
import EyeFilledIcon from "../add-home/icon_eye/EyeFilledIcon";
import { MdOutlineDevicesOther } from "react-icons/md";

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
        promise.abort()
      }
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
        const response = await http.post("api/home/add-home", data, {
          headers: {
            token: `${getCookie("token")?.toString()}`,
          },
        });
        const result = await response.data;
        console.log(result);
        if (result.status == 200) {
          dispatch(successPopUp(result.message));
        } else if (result.status != 200) {
          dispatch(failPopUp(result.message));
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      dispatch(failPopUp("E005"))
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-lg drop-shadow-2xl w-1/3">
          <div className="mb-4">
            <div className="flex flex-col justify-center items-center gap-1 font-bold h-[desiredHeight] text-lg mb-2.5">
              <MdOutlineDevicesOther className="text-2xl" />
              Thêm thiết bị
            </div>
          </div>
          <div className="mb-4">
            <label
              id="ownerNameLabel"
              className="block text-gray-700 text-sm font-bold mb-2"
            >
              Tên thiết bị:
            </label>
            <Select
              options={selectOptions}
              placeholder="Nhập tên thiết bị..."
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
              Tên thiết bị:
            </label>
            <Select
              options={selectOptions}
              placeholder="Nhập tên thiết bị..."
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
              Tên thiết bị:
            </label>
            <Select
              options={selectOptions}
              placeholder="Nhập tên thiết bị..."
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
              Tên thiết bị:
            </label>
            <Select
              options={selectOptions}
              placeholder="Nhập tên thiết bị..."
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
          
          <div className="flex justify-around">
            <Button
              color="danger"
              variant="flat"
              onClick={() => router.push("/admin/list-device")}
            >
              Cancel
            </Button>
            <Button color="primary" onClick={() => handleButton()}>
              Add
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
