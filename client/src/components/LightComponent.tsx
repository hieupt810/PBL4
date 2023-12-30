import http from "@/app/utils/http";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch } from "@/hook/hook";
import { Button } from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { BsLightbulb, BsLightbulbOff } from "react-icons/bs";
import { MdOutlineLight } from "react-icons/md";
import { useRouter } from "next/navigation";
import { IoIosArrowForward } from "react-icons/io";

interface LightType {
  name: string;
  id: string;
  title: string;
  home_id: string;
}

export default function LightComponent({ name, id, title }: LightType) {
  const dispatch = useAppDispatch();

  const router = useRouter();

  const handleButton = async (mode: string) => {
    const data = {
      id: id,
      mode: mode,
    };

    try {
      const response = await http.post("api/led", data, {
        headers: {
          Authorization: `${getCookie("token")?.toString()}`,
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
              <Button
                isIconOnly
                color="warning"
                variant="faded"
                aria-label="Off"
                onClick={() => handleButton("off")}
              >
                <BsLightbulbOff size={24} className="text-red-500" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-5">
          <div
            className="flex items-center justify-between p-4 border rounded-lg shadow-xl"
            onClick={() => router.push(`/home/list-led?home_id=${home_id}`)}
          >
            <MdOutlineLight className="mr-2.5" size={30} />
            <p className="mx-2.5 flex-grow font-sans">LED</p>
            <div className="flex gap-4 items-center">
              <IoIosArrowForward className="mr-2.5" size={30} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
