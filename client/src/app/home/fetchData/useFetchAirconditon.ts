import { useEffect } from "react";
import { useAppDispatch } from "@/hook/store";
import { useRouter } from "next/router";
import { getCookie, hasCookie } from "cookies-next";
import http from "@/app/utils/http";
import { failPopUp } from "@/hook/features/PopupSlice";
import { useSearchParams } from "next/navigation";
import { AirCondition } from "@/app/types/aircondision.type";


export function useFetchAirConditions(
  setAirConditions: React.Dispatch<React.SetStateAction<AirCondition[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const dispatch = useAppDispatch();
  const params = useSearchParams();

  useEffect(() => {
    async function fetchTelevision() {
      if (!hasCookie("token")) return;
      const token = getCookie("token")?.toString();
      try {
        const home_id = getCookie("home_id");
        const response = await http.get(`api/ir/getDevice/AirCondition/home/${home_id}`, {
          headers: {
            token: `${token}`,
          },
        });
        if (response.data.code === 200) {
          const televisionData = response.data.data;
          setAirConditions(televisionData);
          setLoading(false);
        } else {
          dispatch(failPopUp(response.data.message));
        }
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    }
    fetchTelevision();
  }, [dispatch, setAirConditions, setLoading, params]);
}
