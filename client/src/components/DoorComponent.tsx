import React from "react";
import { Button } from "@nextui-org/react";
import { MdOutlineDoorFront } from "react-icons/md";
import { BsLock, BsUnlock } from "react-icons/bs";
import { getCookie } from "cookies-next";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch } from "@/hook/hook";
import http from "@/app/utils/http";

interface DoorType {
  name: string;
}

export default function DoorComponent({ name }: DoorType) {
  const dispatch = useAppDispatch();

  const handleButton = async (mode: string) => {
    try {
      const response = await http.post(`/door/${mode}`, {
        headers: {
          token: `${getCookie("token")?.toString()}`,
        },
      });

      const result = await response.data;
      if (result?.status !== 200 || result == null) {
        dispatch(failPopUp(result.message));
      } else if (result.status == 200) {
        dispatch(successPopUp(result.message));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className="mb-5">
      <div className="flex items-center justify-between p-4 border rounded-lg shadow-xl">
        <MdOutlineDoorFront className="mr-2.5" size={30} />

        <p className="mx-2.5 flex-grow font-sans">{name}</p>

        <div className="flex gap-4 items-center">
          <Button
            isIconOnly
            color="danger"
            aria-label="On"
            onClick={() => handleButton("lock")}
          >
            <BsLock size={24} className="text--500" />
          </Button>
          <Button
            isIconOnly
            color="warning"
            variant="faded"
            aria-label="Off"
            onClick={() => handleButton("unlock")}
          >
            <BsUnlock size={24} className="text-red-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}
