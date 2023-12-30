"use client";
import MobileLayout from "@/app/mobile";
import { Light } from "@/app/types/light.type";
import TelevisionComponent from "@/components/TelevisionComponent";
import { Skeleton } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useFetchLights } from "../fetchData/useFetchLights";
import { Television } from "@/app/types/television.type";
import { useFetchTvs } from "../fetchData/useFetchTv";
import { useFetchAirConditions } from "../fetchData/useFetchAirconditon";

export default function ListLed() {
  const params = useSearchParams();
  const [dh, setDh] = useState<Television[]>([]);
  const tvDh = Array.isArray(dh) ? dh : [];
  const [loading, setLoading] = useState(true);

  useFetchAirConditions(setDh, setLoading);

  return (
    <MobileLayout>
      <h5 className="text-primary font-semibold text-xl text-center">
        Điều hòa hiện tại
      </h5>
      {tvDh.length > 0 ? (
        <div>
          {tvDh.map((tv) => (
            <TelevisionComponent
              key={tv.id}
              name={tv.name}
              id={tv.id}
              home_id={params.get("home_id") || ""}
              title="Detail"
              mode={tv.mode}
            />
          ))}
        </div>
      ) : (
        <div>
          <div className="max-w-[300px] w-full flex items-center mb-7">
            <div>
              <Skeleton className="flex rounded-full w-12 h-12" />
            </div>
            <div className="w-full flex flex-col gap-2">
              <Skeleton className="h-5 w-4/5 rounded-lg" />
              <Skeleton className="h-3 w-3/5 rounded-lg" />
            </div>
          </div>
          <div className="max-w-[300px] w-full flex items-center mb-7">
            <div>
              <Skeleton className="flex rounded-full w-12 h-12" />
            </div>
            <div className="w-full flex flex-col gap-2">
              <Skeleton className="h-5 w-4/5 rounded-lg" />
              <Skeleton className="h-3 w-3/5 rounded-lg" />
            </div>
          </div>
          <div className="max-w-[300px] w-full flex items-center mb-7">
            <div>
              <Skeleton className="flex rounded-full w-12 h-12" />
            </div>
            <div className="w-full flex flex-col gap-2">
              <Skeleton className="h-5 w-4/5 rounded-lg" />
              <Skeleton className="h-3 w-3/5 rounded-lg" />
            </div>
          </div>
          <div className="max-w-[300px] w-full flex items-center mb-7">
            <div>
              <Skeleton className="flex rounded-full w-12 h-12" />
            </div>
            <div className="w-full flex flex-col gap-2">
              <Skeleton className="h-5 w-4/5 rounded-lg" />
              <Skeleton className="h-3 w-3/5 rounded-lg" />
            </div>
          </div>
          <div className="max-w-[300px] w-full flex items-center mb-7">
            <div>
              <Skeleton className="flex rounded-full w-12 h-12" />
            </div>
            <div className="w-full flex flex-col gap-2">
              <Skeleton className="h-5 w-4/5 rounded-lg" />
              <Skeleton className="h-3 w-3/5 rounded-lg" />
            </div>
          </div>
        </div>
      )}
    </MobileLayout>
  );
}
