import { Card, CardBody, CardHeader, Divider } from "@nextui-org/react";
import { GoCheckCircle } from "react-icons/go";
import { LuAlertCircle } from "react-icons/lu";
import { RxCross2 } from "react-icons/rx";

interface PopupProps {
  type?: "success" | "fail";
  text: string;
  close: () => void;
}

export default function Popup({ type, text, close }: PopupProps) {
  if (!type) return null;

  return (
    <div>
      <div className="w-screen h-screen bg-gray-500 opacity-80 fixed top-0 z-30"></div>

      <div className="absolute w-screen h-screen flex items-center justify-center z-40">
        <Card className="w-2/3">
          <CardHeader className="flex items-center gap-3">
            {type === "fail" ? (
              <div className="rounded-full bg-red-500 z-50">
                <LuAlertCircle color={"white"} size={30} />
              </div>
            ) : null}

            {type === "success" ? (
              <div className="rounded-full bg-green-500 z-50">
                <GoCheckCircle color={"white"} size={30} />
              </div>
            ) : null}

            <div className="flex flex-col">
              {type === "fail" ? (
                <p className="text-base text-red-500">Thất bại</p>
              ) : null}
              {type === "success" ? (
                <p className="text-base text-green-500">Thành công</p>
              ) : null}
            </div>

            <button className="absolute top-0 right-0 z-50 p-4" onClick={close}>
              <RxCross2 size={25} color={"gray"} />
            </button>
          </CardHeader>

          <Divider />

          <CardBody>
            <p className="text-center text-sm">{text}</p>
          </CardBody>

          <Divider />
        </Card>
      </div>
    </div>
  );
}
