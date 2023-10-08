"use client";
import { Select, SelectItem } from "@nextui-org/react";
import AdminLayout from "../layout";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Button } from "@nextui-org/react";
import { TbHomePlus } from "react-icons/tb";
import { getUserList } from "@/hook/features/SearchSlice";
import { RootState, useAppDispatch } from "@/hook/store";
import { useSelector } from "react-redux";
import { Users } from "@/app/types/users.type";

export default function AddHome() {
  const rawUserList: Users[] = useSelector(
    (state: RootState) => state.search.userList
  );
  const userList = Array.isArray(rawUserList) ? rawUserList : [];
  console.log(userList);
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const promise = dispatch(getUserList());
    return () => {
      promise.abort();
    };
  }, [dispatch]);

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
            <Select label="Select an">
              {userList
                .filter((user) => user.role !== 2)
                .map((user, index) => (
                  <SelectItem key={index} value={String(user.last_name)}>
                    {user.username}
                  </SelectItem>
                ))}
            </Select>
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
