import { Light } from "@/app/types/light.type";
import http from "@/app/utils/http";
import { failPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch } from "@/hook/store";
import { getCookie, hasCookie } from "cookies-next";
import { useEffect } from "react";

export function useFetchLights(
  setLights: React.Dispatch<React.SetStateAction<Light[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function fetchLights() {
      if (!hasCookie("token")) return;
      const token = getCookie("token")?.toString();
      try {
        const response = await http.get(`api/led`, {
          headers: {
            Authorization: `${token}`,
          },
        });
        if (response.status === 200) {
          const lightsData = response.data.leds;
          setLights(lightsData);
          setLoading(false);
        } else {
          dispatch(failPopUp(response.data.message));
        }
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    }
    fetchLights();
  }, [dispatch, setLights, setLoading]);
}
