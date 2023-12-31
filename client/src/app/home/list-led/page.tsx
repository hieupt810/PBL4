"use client";

import { useState } from "react";

import MobileLayout from "@/app/mobile";
import { Light } from "@/app/types/light.type";
import LightComponent from "@/components/LightComponent";
import { Skeleton } from "@nextui-org/react";
import { useSearchParams } from "next/navigation";
import { useFetchLights } from "../fetchData/useFetchLights";

export default function ListLed() {
  const params = useSearchParams();

  const [lights, setLights] = useState<Light[]>([]);
  const lightList = Array.isArray(lights) ? lights : [];
  const [loading, setLoading] = useState(true);

  useFetchLights(setLights, setLoading);

  return (
    <MobileLayout>
      <h5 className="text-primary font-semibold text-xl text-center">
        LED hiện tại
      </h5>
      {lightList.length > 0 ? (
        <div>
          {lightList.map((light) => (
            <LightComponent
              key={light.id}
              name={light.name}
              id={light.id}
              home_id={params.get("home_id") || ""}
              mode={light.mode}
              title="Detail"
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
