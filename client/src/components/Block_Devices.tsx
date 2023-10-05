import { ReactNode } from "react";
import { twMerge } from "tailwind-merge";
import { AiOutlineRight } from "react-icons/ai";

interface Block_DevicesProps {
  name: string;
  backgroundColor: string;
  Icon: ReactNode;
}

function getClassesForColor(color: string) {
  const colorMap = {
    purple: {
      bg: 'bg-purple-600',
      hover: 'hover:bg-purple-700'
    }
  };

  return (colorMap as any) [color] || {};
}

export function Block_Devices({ name, backgroundColor, Icon }: Block_DevicesProps) {
  const colorClasses = getClassesForColor(backgroundColor);
  return (
    <div
    className={twMerge(
      `${colorClasses.bg} p-4 rounded-[15px] h-24 text-white mt-6 ml-2 w-40 ${colorClasses.hover} flex flex-col justify-center`
    )}
    >
      <div className="flex items-center w-full justify-between mb-2.5">
        <strong>{Icon}</strong>
        <AiOutlineRight className="mr-2.0" />
      </div>
        <strong className="text-lg ml-2">{name}</strong>
    </div>
  );
}
