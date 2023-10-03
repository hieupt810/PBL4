"use client";
import { failPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch, useAppSelector } from "@/hook/hook";
import { Member } from "@/models/member";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";
import MobileLayout from "../mobile";

export default function Member() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.tokenReducer.token);
  const [page, setPage] = useState<number>(1);
  const [members, setMembers] = useState<Member[]>([]);

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(process.env.BACKEND_URL + `api/home?token=${token}&page=${page}`, {
      method: "GET",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.status === 200) {
          setMembers(d.members);
        } else dispatch(failPopUp(d.message));
      });
  }, [dispatch, page, router, token]);

  return (
    <MobileLayout>
      <div className="title">
        <h5>Thành viên</h5>

        <div>
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
      </div>

      <table className="table">
        <tbody>
          <tr>Thành viên</tr>
          <tr>Quyền hạn</tr>
        </tbody>

        {members.map((value, index) => {
          return (
            <tbody key={index}>
              <tr>
                <h5>
                  {value.last_name} {value.first_name}
                </h5>
                <span>@{value.username}</span>
              </tr>

              <tr>{value.role == 2 ? <h4>Quản trị</h4> : null}</tr>
            </tbody>
          );
        })}
      </table>
    </MobileLayout>
  );
}
