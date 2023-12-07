"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button, select } from "@nextui-org/react";
import { RootState, useAppDispatch } from "@/hook/store";
import AdminLayout from "@/app/admin/layout";
import { Select, Input } from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import http from "@/app/utils/http";

interface OptionType {
  value: string;
  label: string;
}

type SelectChangeValueType = OptionType | null;

export default function FormComponent({ title }: { title: string }) {
  const [selectedOption, setSelectedOption] =
    useState<SelectChangeValueType | null>(null);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [pin, setPin] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    return value;
  };

  const handleButtonLED = async () => {
    if (name != "" && pin != "") {
      const data = {
        name,
        pin,
      };
      try {
        const response = await http.post("", data, {
          headers: {
            Authorization: `${getCookie("token")?.toString()}`,
          },
        });
        const result = await response.data;
        console.log(result);
        if (result.code == 200) {
          dispatch(successPopUp(result.data.message));
        } else if (result.status != 200) {
          dispatch(failPopUp(result.data.message));
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      dispatch(failPopUp("E005"))
    }
  };

  const handleButtonDevice = async () => {
    if (selectedOption && name != "" && pin != "") {
      const data = {
        device: selectedOption.value,
        name,
        pin,
      };
      try {
        const response = await http.post("", data, {
          headers: {
            token: `${getCookie("token")?.toString()}`,
          },
        });
        const result = await response.data;
        console.log(result);
        if (result.code == 200) {
          dispatch(successPopUp(result.data.message));
        } else if (result.status != 200) {
          dispatch(failPopUp(result.data.message));
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
      {title === "LED" ? (
        <>
          <Input
            isRequired
            type="text"
            label="Name"
            value={name}
            className="mb-5 h-12 mr-32"
            onChange={(e) => {
              const value = handleInputChange(e);
              setName(value);
            }}
          />

          <Input
            isRequired
            type="text"
            label="Pin"
            value={pin}
            className="mb-5 h-12 mr-32"
            onChange={(e) => {
              const value = handleInputChange(e);
              setPin(value);
            }}
          />
          <div className="flex justify-around">
            <Button
              color="danger"
              variant="flat"
              onClick={() => router.push("/admin/list-device")}
            >
              Cancel
            </Button>
            <Button color="primary" onClick={() => handleButtonLED}>
              Add
            </Button>
          </div>
        </>
      ) : (
        <>
          <Select
            isRequired
            label="Device IR"
            placeholder="Select an device IR"
            className="mb-7 h-12 mr-52"
          >
            {/* {animals.map((animal) => (
            <SelectItem key={animal.value} value={animal.value}>
            {animal.label}
            </SelectItem>
          ))} */}
          </Select>

          <Input
            isRequired
            type="text"
            label="Name"
            value={pin}
            className="mb-7 h-12 mr-32"
            onChange={(e) => {
              const value = handleInputChange(e);
              setName(value);             
            }}
          />
          <Input
            isRequired
            type="text"
            label="Pin"
            value={pin}
            className="mb-7 h-12 mr-32"
            onChange={(e) => {
              const value = handleInputChange(e);
              setPin(value);
            }}
          />
          <div className="flex justify-around">
            <Button
              color="danger"
              variant="flat"
              onClick={() => router.push("/admin/list-device")}
            >
              Cancel
            </Button>
            <Button color="primary" onClick={() => {}}>
              Add
            </Button>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
