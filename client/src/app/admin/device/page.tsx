"use client";
import http from "@/app/utils/http";
import { Button, Input, Select, SelectItem } from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

export default function AddDeviceMethod() {
  const params = useSearchParams();
  const router = useRouter();

  const [listFunctions, setListFunction] = useState([]);

  const [selected, setSelected] = useState<string>("");
  const [irCode, setIrCode] = useState("");

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    http.get("/api/ir/getFuncs").then((response) => {
      setListFunction(response.data.data);
    });
  }, []);

  const addDeviceMethod = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    http
      .post(`/api/ir/addIr`, {
        ir_code: irCode,
        id_device: params.get("device"),
        id_mode: selected,
      })
      .then((response) => {
        if (response.data.code === 200) {
          router.push(`/admin/list-device?id=${params.get("home")}`);
        } else {
          setError("Đã xảy ra lỗi, vui lòng thử lại sau.");
        }
      });
  };

  return (
    <div className="mt-14 px-4 mx-auto w-1/2 shadow-md rounded-md border border-gray-300">
      <h3 className="font-bold text-center uppercase text-xl my-12">
        Tạo phương thức cho thiết bị
      </h3>

      <form onSubmit={addDeviceMethod}>
        <div className="space-y-6">
          <Select
            isRequired
            size="md"
            label="Phương thức"
            onChange={(e) => {
              setSelected(e.target.value);
            }}
          >
            {listFunctions?.map((value: any) => {
              return (
                <SelectItem
                  key={value.id}
                  className="capitalize"
                  value={value.mode}
                >
                  {value.mode}
                </SelectItem>
              );
            })}
          </Select>

          <Input
            isRequired
            size="md"
            label="Tín hiệu hồng ngoại"
            placeholder="Nhập tín hiệu"
            value={irCode}
            onValueChange={setIrCode}
          />
        </div>

        {error ? <p className="text-red-500 my-4">{error}</p> : null}

        <Button
          type="submit"
          size="md"
          radius="md"
          color="primary"
          className="my-8"
        >
          Xác nhận
        </Button>
      </form>
    </div>
  );
}
