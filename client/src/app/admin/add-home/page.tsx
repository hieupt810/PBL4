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

  useEffect(() => {
    if (debouncedSearchValue) {
      dispatch(getUserList());
    }
  }, [debouncedSearchValue, dispatch]);

  const selectOptions = userList.map((user) => ({
    value: user.last_name || "",
    label: user.username || "",
  }));

  const NoDropdownIndicator = () => null;

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
          <div className="flex justify-around">
            <Button
              color="danger"
              variant="flat"
              onClick={() => router.push("/admin")}
            >
              Cancel
            </Button>
            <Button color="primary" onClick={() => {}}>
              Add
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
