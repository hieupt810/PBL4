import Popup from "@/components/Popup";
import { resetLoading } from "@/hook/features/LoadingSlice";
import { resetPopUp } from "@/hook/features/PopupSlice";
import { getToken } from "@/hook/features/TokenSlice";
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
    dispatch(getToken());
    dispatch(resetPopUp());
    dispatch(resetLoading());
  }, [dispatch]);

  return (
    <div className="text-base text-black/90 font-normal font-sans">
      <Popup
        text={popup.text}
        type={popup.type}
        close={() => dispatch(resetPopUp())}
      />

      <div className="w-screen overflow-x-hidden min-h-screen overflow-y-auto bg-gray-50 space-y-6 px-4 py-6">
        {children}
      </div>
    </div>
  );
}
