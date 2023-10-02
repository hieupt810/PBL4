import { AiOutlineCheck, AiOutlineClose } from "react-icons/ai";
import { IoAlertCircleOutline } from "react-icons/io5";

interface ConfirmPopupProps {
  text: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmPopup({
  text,
  onConfirm,
  onCancel,
}: ConfirmPopupProps) {
  if (!text) return null;

  return (
    <div>
      <div className="w-screen h-screen bg-gray-500 opacity-80 fixed top-0 z-30"></div>

      <div className="absolute z-40 w-screen h-screen flex flex-col items-center justify-center px-6">
        <div className="bg-white p-8 rounded-md flex flex-col items-center justify-center shadow-lg relative space-y-4">
          <div className="bg-[#edc74c] rounded-full text-white">
            <IoAlertCircleOutline size={50} />
          </div>

          <span className="text-center text-xl font-medium">{text}</span>

          <div className="flex flex-row space-x-4">
            <button
              onClick={onConfirm}
              className="p-2 rounded-md bg-green-400 text-white transform transition-transform active:scale-90"
            >
              <AiOutlineCheck size={15} />
            </button>

            <button
              onClick={onCancel}
              className="p-2 rounded-md bg-red-400 text-white transition-transform active:scale-90"
            >
              <AiOutlineClose size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
