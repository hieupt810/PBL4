import http from "@/app/utils/http";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch } from "@/hook/hook";
import { Button } from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { BsLightbulb, BsLightbulbOff } from "react-icons/bs";
import { IoIosArrowForward } from "react-icons/io";
import { MdOutlineLight } from "react-icons/md";

type mode = {
  id: string;
  mode: string;
};

interface LightType {
  name: string;
  id: string;
  title: string;
  home_id: string;
  mode: mode[];
}

export default function LightComponent({
  name,
  id,
  title,
  home_id,
  mode,
}: LightType) {
  const dispatch = useAppDispatch();

  const router = useRouter();

  const handleButton = async (mode: string) => {
    const data = {
      id_device: id,
      id_mode: mode,
    };

    try {
      const response = await http.post("api/ir/control", data, {
        headers: {
          Authorization: `${getCookie("token")?.toString()}`,
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
            <MdOutlineLight className="mr-2.5" size={30} />
            <p className="mx-2.5 flex-grow font-sans">{name}</p>
            <div className="flex gap-4 items-center">
              {mode?.some((element) => {
                if (element.mode === "on") {
                  return true;
                }
                return false;
              }) ? (
                <Button
                  isIconOnly
                  color="danger"
                  aria-label="On"
                  onClick={() => handleButton("on")}
                >
                  <BsLightbulb size={24} className="text--500" />
                </Button>
              ) : null}
              {mode?.some((element) => {
                if (element.mode === "off") {
                  return true;
                }
                return false;
              }) ? (
                <Button
                  isIconOnly
                  color="warning"
                  variant="faded"
                  aria-label="Off"
                  onClick={() => handleButton("off")}
                >
                  <BsLightbulbOff size={24} className="text-red-500" />
                </Button>
              ) : null}
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
