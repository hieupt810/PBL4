import React from "react";
import { Button } from "@nextui-org/react";
import {
  PiTelevisionBold,
  PiTelevision,
  PiTelevisionLight,
} from "react-icons/pi";
import { getCookie } from "cookies-next";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch } from "@/hook/hook";
import http from "@/app/utils/http";
import { IoIosArrowForward } from "react-icons/io";
import { useRouter } from "next/navigation";

interface TelevisionType {
  name: string;
  id: string;
  title: string;
}

export default function TelevisionComponent({
  name,
  id,
  title,
}: TelevisionType) {
  const dispatch = useAppDispatch();
  const router = useRouter();


  const handleButton = async () => {
    const data = {
      id: id,
    };

    try {
      const response = await http.post("api/control", data, {
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
    <>
      {title === "Detail" ? (
        <div className="mb-5">
          <div className="flex items-center justify-between p-4 border rounded-lg shadow-xl">
            <PiTelevisionBold className="mr-2.5" size={30} />
            <p className="mx-2.5 flex-grow font-sans">{name}</p>
            <div className="flex gap-4 items-center">
              <Button
                isIconOnly
                color="danger"
                aria-label="On"
                onClick={() => handleButton()}
              >
                <PiTelevision size={24} className="text--500" />
              </Button>
              <Button
                isIconOnly
                color="warning"
                variant="faded"
                aria-label="Off"
                onClick={() => handleButton()}
              >
                <PiTelevisionLight size={24} className="text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-5">
          <div className="flex items-center justify-between p-4 border rounded-lg shadow-xl"  onClick={() => router.push(`/home/list-tv`)}>
            <PiTelevisionBold className="mr-2.5" size={30} />
            <p className="mx-2.5 flex-grow font-sans">{name}</p>
            <div className="flex gap-4 items-center">
              <IoIosArrowForward className="mr-2.5" size={30} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
