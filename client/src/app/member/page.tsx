"use client";
import { failPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch } from "@/hook/hook";
import { Member } from "@/models/member";
import { getCookie, hasCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import MobileLayout from "../mobile";
import http from "../utils/http";
import { User, Link, Skeleton } from "@nextui-org/react";
import Man from "@/static/man.jpg";
import Woman from "@/static/woman.png";
import { MemberComponent } from "@/components/MemberComponent";

export default function Member() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [page, setPage] = useState<number>(1);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (!hasCookie("token")) {
      router.push("/login");
      return;
    }

    const token = getCookie("token")?.toString();

    const fetchListMembers = async () => {
      try {
        const response = await http.get(`api/home/list-member`, {
          headers: {
            token: `${token}`,
          },
        });

        if (response.status === 200) {
          const membersData = response.data.members;
          setMembers(membersData);
        } else {
          dispatch(failPopUp(response.data.message));
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchListMembers();
  }, [dispatch, page, router]);

  return (
    <MobileLayout>
      <h5 className="text-primary font-semibold text-xl text-center">
        Danh sách thành viên
      </h5>

      {members.length > 0 ? (
        <div>
          {members.map((value, index) => {
            return (
              <MemberComponent
                key={index}
                value={value}
                Man={Man}
                Woman={Woman}
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
