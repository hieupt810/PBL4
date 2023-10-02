import Popup from "@/components/Popup";
import { resetPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch, useAppSelector } from "@/hook/hook";
import { useEffect } from "react";

export default function MobileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const popup = useAppSelector((state) => state.popupReducer);

  useEffect(() => {
    dispatch(resetPopUp());
  }, [dispatch]);

  return (
    <div className="text-base text-[#393939] font-normal font-sans">
      <Popup
        text={popup.text}
        type={popup.type}
        close={() => dispatch(resetPopUp())}
      />

      <div className="w-screen overflow-x-hidden min-h-screen overflow-y-auto bg-[#f5f5f5] space-y-6 px-4 py-6">
        {children}
      </div>
    </div>
  );
}
