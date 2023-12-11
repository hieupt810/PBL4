import { useEffect } from "react";
import { useAppDispatch } from "@/hook/store";
import { useRouter } from "next/router";
import { getCookie, hasCookie } from "cookies-next";
import http from "@/app/utils/http";
import { failPopUp } from "@/hook/features/PopupSlice";
import { Television } from "@/app/types/television.type";
import { useSearchParams } from "next/navigation";

export function useFetchTvs(
  setTelevisions: React.Dispatch<React.SetStateAction<Television[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const dispatch = useAppDispatch();
  const params = useSearchParams();

  useEffect(() => {
    async function fetchTelevision() {
      if (!hasCookie("token")) return;
      const token = getCookie("token")?.toString();
      try {
        const response = await http.get(`api/ir/getDevice/tv/home/${params.get("home_id")}`, {
          headers: {
            token: `${token}`,
          },
        });
        if (response.status === 200) {
          const televisionData = response.data.devices;
          setTelevisions(televisionData);
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
  }, [dispatch, setTelevisions, setLoading, params]);
}
