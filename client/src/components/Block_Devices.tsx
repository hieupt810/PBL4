import { ReactNode } from "react";
import { AiOutlineRight } from "react-icons/ai";
import { twMerge } from "tailwind-merge";

interface Block_DevicesProps {
  name: string;
  backgroundColor: string;
  Icon: ReactNode; 
}

export function Block_Devices({ name, backgroundColor, Icon }: Block_DevicesProps) {
  return (
    <div
      className={twMerge(
        `bg-${backgroundColor}-600 p-4 rounded-[15px] h-24 text-white mt-6 ml-2 w-40 hover:bg-${backgroundColor}-700 flex flex-col justify-center`
      )}
    >
      <div className="flex items-center w-full justify-between mb-2.5">
        {Icon}
        <AiOutlineRight className="mr-2.0" />
      </div>
        <span className="text-base ml-2">{name}</span>
    </div>
  );
}
