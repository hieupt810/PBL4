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

      <div className="absolute z-40 w-screen h-screen flex flex-col items-center justify-center px-6">
        <div className="bg-white px-10 py-8 rounded-md flex flex-col items-center justify-center shadow-lg relative">
          {type === "fail" ? (
            <div className="rounded-full bg-red-500 z-50">
              <LuAlertCircle color={"white"} size={50} />
            </div>
          ) : null}

          {type === "success" ? (
            <div className="rounded-full bg-green-500 z-50">
              <GoCheckCircle color={"white"} size={50} />
            </div>
          ) : null}

          <button className="absolute top-0 right-0 z-50 p-3" onClick={close}>
            <RxCross2 size={25} color={"gray"} />
          </button>

          <span
            className={`mt-4 text-center text-xl font-medium ${
              type === "failed" ? "text-red-500" : ""
            } ${type === "success" ? "text-green-500" : ""}`}
          >
            {text}
          </span>
        </div>
      </div>
    </div>
  );
}
