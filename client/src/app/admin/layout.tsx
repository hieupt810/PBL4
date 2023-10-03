"use client";
import { resetLoading } from "@/hook/features/LoadingSlice";
import { useAppDispatch } from "@/hook/hook";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(resetLoading());
  }, [dispatch]);

  return <div>{children}</div>;
}
