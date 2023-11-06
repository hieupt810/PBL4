"use client";
import Popup from "@/components/Popup";
import { resetLoading } from "@/hook/features/LoadingSlice";
import { resetPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch, useAppSelector } from "@/hook/hook";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();
  const popup = useAppSelector((state) => state.popupReducer);

  useEffect(() => {
    dispatch(resetLoading());
  }, [dispatch]);

  return (
    <div>
      <Popup
        text={popup.text}
        type={popup.type}
        close={() => dispatch(resetPopUp())}
      />
      {children}
    </div>
  );
}
