"use client";
import { Users } from "@/app/types/users.type";
import useDebounce from "@/hook/custoom/useDebounce";
import { getUserList } from "@/hook/features/SearchSlice";
import { RootState, useAppDispatch } from "@/hook/store";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import AdminLayout from "../layout";

import http from "@/app/utils/http";
import FormComponent from "@/components/FormComponent";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { Tab, Tabs } from "@nextui-org/react";
import { getCookie } from "cookies-next";
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
        promise.abort();
      };
    }
  }, [debouncedSearchValue, dispatch]);

  const selectOptions = userList.map((user) => ({
    value: user.username || "",
    label: user.username || "",
  }));

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
        result;
        if (result.status == 200) {
          dispatch(successPopUp(result.message));
        } else if (result.status != 200) {
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
              <MdOutlineDevicesOther className="text-2xl" />
              Thêm thiết bị
              <Tabs
                key="primary"
                color="primary"
                aria-label="Tabs colors"
                radius="full"
              >
                <Tab key="led" title="LED">
                  <FormComponent title="LED" />
                </Tab>
                <Tab key="ir" title="Device IR">
                  <FormComponent title="Device IR" />
                </Tab>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
