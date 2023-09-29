import { RxCrossCircled } from "react-icons/rx";
import Button from "./Button";

interface PopupProps {
  type: "success" | "failed";
  text: string;
  close: () => void;
}

export default function Popup({ type, text, close }: PopupProps) {
  return (
    <div>
      <div className="w-screen h-screen bg-gray-400 opacity-80 fixed top-0 z-30"></div>
      <div className="absolute z-40 w-screen h-screen flex flex-col items-center justify-center px-6">
        <div className="bg-white px-14 py-6 rounded-md flex flex-col items-center justify-center space-y-4 shadow-lg ease-in">
          {type === "failed" ? (
            <div className="rounded-full bg-red-500 p-1 z-50">
              <RxCrossCircled color={"white"} size={40} />
            </div>
          ) : null}

          <span className="text-lg">{text}</span>

          <Button text={"Đóng"} className="text-sm" />
        </div>
      </div>
    </div>
  );
}
