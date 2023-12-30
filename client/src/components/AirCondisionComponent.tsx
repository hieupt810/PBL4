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
import { useRouter } from "next/navigation";
import { IoIosArrowForward } from "react-icons/io";
import { MdArrowDropDown, MdArrowDropUp } from "react-icons/md";
import { TbAirConditioning, TbAirConditioningDisabled } from "react-icons/tb";

type mode = {
    id: string;
    mode: string;
};
interface AirConditionType {
    name: string;
    id: string;
    title: string;
    home_id: string;
    mode?: mode[];
}

export default function AirConditionComponent({
    name,
    id,
    title,
    mode,
}: AirConditionType) {
    const dispatch = useAppDispatch();
  const router = useRouter();

    const handleButton = async (mode_id:String) => {
        const data = {
          "id_device":id,
          "id_mode":mode_id
        };

        try {
            const response = await http.post("api/ir/control", data, {
                headers: {
                    token: `${getCookie("token")?.toString()}`,
                },
            });

            const result = await response.data;
            if (result?.code !== 200 || result == null) {
                dispatch(failPopUp(result.message));
            } else if (result.code == 200) {
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
              {mode?.map((element) => {
                if (element.mode === "on") {
                    return (
                        <Button
                            key={element.id}
                            isIconOnly
                            color="danger"
                            aria-label="On"
                            onClick={() => handleButton(element.id)} // Truyền element.id vào hàm
                        >
                            <TbAirConditioning size={24} className="text--500" />
                        </Button>
                    );
                } else if (element.mode === "off") {
                    return (
                        <Button
                            key={element.id}
                            isIconOnly
                            color="warning"
                            variant="faded"
                            aria-label="Off"
                            onClick={() => handleButton(element.id)} // Truyền element.id vào hàm
                        >
                            <TbAirConditioningDisabled size={24} className="text-red-500" />
                        </Button>
                    );
                } else if (element.mode === "up") {
                  return (
                      <Button
                          key={element.id}
                          isIconOnly
                          color="danger"
                          variant="faded"
                          aria-label="Up"
                          onClick={() => handleButton(element.id)} // Truyền element.id vào hàm
                      >
                          <MdArrowDropUp size={24} className="text-red-500" />
                      </Button>
                  );
              } else if (element.mode === "down") {
                return (
                    <Button
                        key={element.id}
                        isIconOnly
                        color="warning"
                        variant="faded"
                        aria-label="Down"
                        onClick={() => handleButton(element.id)} // Truyền element.id vào hàm
                    >
                        <MdArrowDropDown size={24} className="text-red-500" />
                    </Button>
                );
            } return null;
            })}

            </div>
          </div>
        </div>
      ) : (
        <div className="mb-5">
          <div className="flex items-center justify-between p-4 border rounded-lg shadow-xl"  onClick={() => router.push(`/home/list-aircondition?home_id=${home_id}`)}>
            <TbAirConditioning className="mr-2.5" size={30} />
            <p className="mx-2.5 flex-grow font-sans">Air Condition</p>
            <div className="flex gap-4 items-center">
              <IoIosArrowForward className="mr-2.5" size={30} />
            </div>
          </div>
        </div>
      )}
    </>
    );
}
