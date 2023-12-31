"use client";
import { hasCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
export default function Home() {
  const router = useRouter();
  useEffect(() => {
    if (!hasCookie("token")) {
      router.push("/login");
      return;
    }
  });
  return <main></main>;
}
