"use client";
import { failPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch } from "@/hook/hook";
import { getCookie, hasCookie } from "cookies-next";
import { useEffect, useState } from "react";
import MobileLayout from "../mobile";
import http from "../utils/http";
import { Skeleton } from "@nextui-org/react";
import { useRouter, useSearchParams } from "next/navigation";
import { HistoryComponent } from "@/components/HistoryComponent";
import { History } from "../types/history.type";


export default function Member() {
  const dispatch = useAppDispatch();
  const [history, setListHistory] = useState<History[]>([]);
  const historyList = Array.isArray(history) ? history : [];
  const router = useRouter();
  const params = useSearchParams();


  useEffect(() => {
    if (!hasCookie("token")) {
      router.push("/login");
      return;
    }

    const token = getCookie("token")?.toString();

    const fetchListHistory = async () => {
      try {
        const response = await http.get(`api/door/history/home/${params.get("home_id")}`, {
          headers: {
            token: `${token}`,
          },
        });

        if (response.data.code === 200) {
          const historyData = response.data.data;
          console.log(historyData)
          setListHistory(historyData);
        } else {
          dispatch(failPopUp(response.data.message));
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchListHistory();
  }, [dispatch, router, params]);

  return (
    <MobileLayout>
      <h5 className="text-primary font-semibold text-xl text-center">
        Lịch sử ra\vào nhà
      </h5>
      {historyList.length > 0 ? (
        <div>
          {historyList.map((value, index) => {
            return (
              <HistoryComponent
                key={index}
                value = {value}
              />

              // <tbody key={index}>
              //   <tr>
              //     <h5>
              //       {value.last_name} {value.first_name}
              //     </h5>
              //     <span>@{value.username}</span>
              //   </tr>

              //   <tr>{value.role == 2 ? <h4>Quản trị</h4> : null}</tr>
              // </tbody>
            );
          })}
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

{
  /* <div>
          <button
            type="button"
            onClick={() => setPage(page - 1 >= 1 ? page - 1 : 1)}
          >
            <BiChevronLeft size={25} />
          </button>

          <button type="button" onClick={() => setPage(page + 1)}>
            <BiChevronRight size={25} />
          </button>
        </div>
      </div> */
}
