"use client";

import { MemberComponent } from "@/components/MemberComponent";
import ModalComponent from "@/components/ModalComponent";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { getMemberList, setHomeId } from "@/hook/features/SearchSlice";
import { useAppDispatch } from "@/hook/hook";
import { RootState } from "@/hook/store";
import { Member } from "@/models/member";
import Man from "@/static/man.jpg";
import Woman from "@/static/woman.png";
import { Skeleton } from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AiOutlineUsergroupAdd } from "react-icons/ai";
import { useSelector } from "react-redux";
import MobileLayout from "../mobile";
import http from "../utils/http";

export default function Member() {
  const rawMemberList: Member[] = useSelector(
    (state: RootState) => state.search.memberList
  );
  const dispatch = useAppDispatch();
  const [page, setPage] = useState<number>(1);
  const membersList = Array.isArray(rawMemberList) ? rawMemberList : [];
  const [username, setUsername] = useState("");
  const [hasCalledApi, setHasCalledApi] = useState(false);
  const params = useSearchParams();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUsername(value);
  };

  // useEffect(() => {
  //   if (!hasCookie("token")) {
  //     router.push("/login");
  //     return;
  //   }

  //   const token = getCookie("token")?.toString();

  //   const fetchListMembers = async () => {
  //     try {
  //       const response = await http.get(`api/home/list-member`, {
  //         headers: {
  //           token: `${token}`,
  //         },
  //       });

  //       if (response.status === 200) {
  //         const membersData = response.data.members;
  //         setMembers(membersData);
  //       } else {
  //         dispatch(failPopUp(response.data.message));
  //       }
  //     } catch (error) {
  //       console.error("Error:", error);
  //     }
  //   };

  //   fetchListMembers();
  // }, [dispatch, router]);
  // FetchMembers(setMembers, router);
  const homeId = params.get("home_id");

  useEffect(() => {
    if (homeId !== null) {
      dispatch(setHomeId(homeId));
    }
    const promise = dispatch(getMemberList());
    return () => {
      promise.abort();
    };
  }, [dispatch, homeId]);

  const handleAddMember = async () => {
    if (username != "") {
      const data = {
        username,
      };
      try {
        const response = await http.post(
          `api/home/${params.get("home_id")}/member`,
          data,
          {
            headers: {
              token: `${getCookie("token")?.toString()}`,
            },
          }
        );
        const result = await response.data;
        if (result.code == 200) {
          dispatch(successPopUp(result.message));
        } else if (result.code != 200) {
          dispatch(failPopUp(result.message));
        }
        setUsername("");
        setHasCalledApi(true);
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      dispatch(failPopUp("E005"));
    }
  };

  useEffect(() => {
    if (hasCalledApi) {
      dispatch(getMemberList());
      setHasCalledApi(false);
    }
  }, [dispatch, hasCalledApi]);

  return (
    <MobileLayout>
      <h5 className="text-primary font-semibold text-xl text-center">
        Danh sách thành viên
      </h5>

      {membersList.length > 0 ? (
        <div>
          {membersList.map((value, index) => {
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
      <div className="fixed bottom-7 right-7">
        <ModalComponent
          icon={<AiOutlineUsergroupAdd size={20} className="text--500" />}
          name="Add"
          title="Add member"
          handleInputChange={handleInputChange}
          handleAddMember={handleAddMember}
        />
      </div>
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
