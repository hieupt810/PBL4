import { twMerge } from "tailwind-merge";

interface ButtonProps {
  text: string;
  type?: "button" | "submit" | "reset";
  className?: string;
  loading?: boolean;
  onClick?: () => void;
}

export default function Button({
  className,
  type,
  text,
  loading,
  onClick,
}: ButtonProps) {
  return (
    <button
      className={twMerge(
        "text-white bg-primary rounded-md font-medium outline-none border-none transform transition-transform focus:ring-2 active:scale-95 flex items-center justify-center px-2",
        className
      )}
      type={type}
      onClick={onClick}
    >
      {loading && (
        <div
          className="animate-spin inline-block w-4 h-4 border-[2px] border-current border-t-transparent text-white rounded-full"
          role="status"
          aria-label="loading"
        ></div>
      )}
      <span className="p-2">{text}</span>
    </button>
  );
}
