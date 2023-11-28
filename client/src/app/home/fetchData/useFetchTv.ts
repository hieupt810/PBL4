import { useEffect } from "react";
import { useAppDispatch } from "@/hook/store";
import { useRouter } from "next/router";
import { getCookie, hasCookie } from "cookies-next";
import http from "@/app/utils/http";
import { failPopUp } from "@/hook/features/PopupSlice";
import { Television } from "@/app/types/television.type";

interface Ctr{
  id: string;
  mode: string;
}
interface TelevisionType {
  name: string;
  listCtr : Ctr[];
}

export function useFetchTvs(
  setTelevisions: React.Dispatch<React.SetStateAction<Television[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    async function fetchtvs() {
      if (!hasCookie("token")) return;
      const token = getCookie("token")?.toString();
      try {
        const response = await http.get(`api/ir/getDevice/tv`, {
          headers: {
            token: `${token}`,
          },
        });
        if (response.status === 200) {
          const tvsData = response.data.devices;
          let tvs: TelevisionType[] = [];

          for (let i = 0; i < tvsData.length; i++) {
            const found = tvs.find((tv) => tv.name === tvsData[i].name);

            if (!found) {
              const newTelevision: TelevisionType = {
                name: tvsData[i].name,
                listCtr = tvsData[i].ctr,
              };
              tvs.push(newTelevision);
            }
          }

          setTelevisions(tvs);
          setLoading(false);
        } else {
          dispatch(failPopUp(response.data.message));
        }
      } catch (error) {
        console.error("Error:", error);
        setLoading(false);
      }
    }
    fetchtvs();
  }, [dispatch, setTelevisions, setLoading]);
}
