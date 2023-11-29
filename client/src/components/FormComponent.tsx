"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button, select } from "@nextui-org/react";
import { RootState, useAppDispatch } from "@/hook/store";
import { useSelector } from "react-redux";
import { Users } from "@/app/types/users.type";
import useDebounce from "@/hook/custoom/useDebounce";
import { MdOutlineDevicesOther } from "react-icons/md";
import AdminLayout from "@/app/admin/layout";
import {Select, SelectItem} from "@nextui-org/react";


interface OptionType {
  value: string;
  label: string;
}

type SelectChangeValueType = OptionType | null;

export default function FormComponent() {
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

  const [isVisible, setIsVisible] = React.useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);


  return (
    <AdminLayout>
      <div className="flex w-full flex-wrap md:flex-nowrap gap-4">
      <Select
        label="Favorite Animal"
        placeholder="Select an animal"
        className="max-w-xs"
      >
        {/* {animals.map((animal) => (
          <SelectItem key={animal.value} value={animal.value}>
            {animal.label}
          </SelectItem>
        ))} */}
      </Select>
    </div>
    </AdminLayout>
  );
}
