"use client";

import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Button, SelectItem, select } from "@nextui-org/react";
import { RootState, useAppDispatch } from "@/hook/store";
import AdminLayout from "@/app/admin/layout";
import { Select, Input } from "@nextui-org/react";
import { getCookie, hasCookie } from "cookies-next";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import http from "@/app/utils/http";

interface OptionType {
  value: string;
  label: string;
}

export default function FormComponent({ title }: { title: string }) {
  const [selectedValue, setSelectedValue] = useState<string>("");
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [name, setName] = useState("");
  const [pin, setPin] = useState("");
  const params = useSearchParams();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    return value;
  };

  const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOption = event.target.value;
    setSelectedValue(selectedOption);
  };

  const handleButtonLED = async () => {
    if (name != "" && pin != "") {
      const data = {
        name,
        pin,
        home_id: params.get("id"),
      };
      try {
        const response = await http.post("api/led/create", data, {
          headers: {
            Authorization: `${getCookie("token")?.toString()}`,
          },
        });
        const result = await response.data;
        if (result.code == 200) {
          dispatch(successPopUp(result.data.message));
        } else if (result.code != 200) {
          dispatch(failPopUp(result.data.message));
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      dispatch(failPopUp("E001"));
    }
  };

  const handleButtonDevice = async () => {
    if (selectedValue && name != "" && pin != "") {
      const data = {
        device: selectedValue,
        name,
        pin,
        home_id: params.get("id"),
      };
      try {
        const response = await http.post("api/ir/create", data, {
          headers: {
            Authorization: `${getCookie("token")?.toString()}`,
          },
        });
        const result = await response.data;
        if (result.code == 200) {
          dispatch(successPopUp(result.data.message));
        } else if (result.code != 200) {
          dispatch(failPopUp(result.data.message));
        }
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      dispatch(failPopUp("E001"));
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
              onClick={() =>
                router.push(`/admin/list-device?id=${params.get("id")}`)
              }
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={() => {
                handleButtonLED();
                router.push(`/admin/list-device?id=${params.get("id")}`);
              }}
            >
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
            onChange={handleSelectChange}
            value={selectedValue}
          >
            <SelectItem key="tv" value="tv">
              TV
            </SelectItem>
            <SelectItem key="AirCondision" value="AirCondision">
              AirCondision
            </SelectItem>
          </Select>

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
              onClick={() =>
                router.push(`/admin/list-device?id=${params.get("id")}`)
              }
            >
              Cancel
            </Button>
            <Button
              color="primary"
              onClick={() => {
                handleButtonDevice();
                router.push(`/admin/list-device?id=${params.get("id")}`);
              }}
            >
              Add
            </Button>
          </div>
        </>
      )}
    </AdminLayout>
  );
}
