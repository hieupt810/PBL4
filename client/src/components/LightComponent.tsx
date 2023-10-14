import React from "react";
import { Button } from "@nextui-org/react";
import { MdOutlineLight } from "react-icons/md";
import { BsLightbulb, BsLightbulbOff } from "react-icons/bs";
import { getCookie } from "cookies-next";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch } from "@/hook/hook";
import http from "@/app/utils/http";

interface LightType {
  name: string;
  id: string;
}

export default function LightComponent({ name, id }: LightType) {
  const dispatch = useAppDispatch();

  const handleButton = async (mode : string) => {
    const data = {
      id: id,
      mode: mode,
    };

    try {
      const response = await http.post("api/led", data, {
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

    <div className="flex items-center justify-between p-4 border rounded-lg shadow-xl" >

      <MdOutlineLight className="mr-2.5" size={30} />

      <p className="mx-2.5 flex-grow font-sans">{name}</p>

      <div className="flex gap-4 items-center">
        <Button
          isIconOnly
          color="danger"
          aria-label="On"
          onClick={() => handleButton("on")}
        >
          <BsLightbulb size={24} className="text--500" />
        </Button>
        <Button isIconOnly color="warning" variant="faded" aria-label="Off" onClick={() => handleButton("off")}>
          <BsLightbulbOff size={24} className="text-red-500" />
        </Button>
      </div>
    </div>
  );
}
