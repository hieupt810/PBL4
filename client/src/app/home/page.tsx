"use client";
import ConfirmPopup from "@/components/ConfirmPopup";
import { failPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch, useAppSelector } from "@/hook/hook";
import { Member } from "@/models/member";
import Man from "@/static/man.jpg";
import Woman from "@/static/woman.png";
import { Avatar, Button, Skeleton } from "@nextui-org/react";
import { deleteCookie } from "cookies-next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BsArrowRightShort } from "react-icons/bs";
import { FaTemperatureFull } from "react-icons/fa6";
import { FiEdit, FiLogOut } from "react-icons/fi";
import { WiHumidity } from "react-icons/wi";
import MobileLayout from "../mobile";
import "./styles.css";

interface ConfirmPopupProps {
  text: string;
  onConfirm: () => void;
}

export default function HomeInformation() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const token = useAppSelector((state) => state.tokenReducer.token);

  const [user, setUser] = useState<Member>();
  const [members, setMembers] = useState<Member[]>([]);
  const [confirmPopup, setConfirmPopup] = useState<ConfirmPopupProps>({
    text: "",
    onConfirm: () => {},
  });

  useEffect(() => {
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(process.env.BACKEND_URL + `api/auth?token=${token}`, {
      method: "GET",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.status == 200) setUser(d.profile);
        else dispatch(failPopUp(d.message));
      });

    fetch(process.env.BACKEND_URL + `api/home?token=${token}`, {
      method: "GET",
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.status == 200) {
          setMembers(d.members);
        } else dispatch(failPopUp(d.message));
      });
  }, [dispatch, router, token]);

  return (
    <div>
      <ConfirmPopup
        text={confirmPopup.text}
        onConfirm={confirmPopup.onConfirm}
        onCancel={() => {
          setConfirmPopup({ text: "", onConfirm: () => {} });
        }}
      />

      <MobileLayout>
        {user?.username && user.first_name ? (
          <div className="flex flex-row gap-3 items-center">
            <Avatar
              isBordered
              showFallback
              color="primary"
              size="md"
              src={
                user.gender == 0
                  ? "https://cdn3.iconfinder.com/data/icons/avatars-round-flat/33/man5-512.png"
                  : "https://cdn1.iconfinder.com/data/icons/avatars-1-5/136/60-512.png"
              }
            />

            <div className="flex flex-col">
              <span className="font-bold text-lg">
                Xin chào, {user.last_name} {user.first_name}!
              </span>
              <span className="text-gray-400 text-sm">@{user.username}</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="max-w-[300px] w-full flex items-center gap-3">
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

        <div className="space-x-4">
          <Link href={"/profile"}>
            <Button isIconOnly color="primary">
              <FiEdit size={20} />
            </Button>
          </Link>

          <Button
            isIconOnly
            color="primary"
            onClick={() => {
              deleteCookie("token");
              router.push("/");
            }}
          >
            <FiLogOut size={20} color="white" />
          </Button>
        </div>

        <div className="container">
          <h5>Thiết bị của tôi</h5>

          <div className="items_container">
            <div className="item bg-[#7443eb]">
              <div className="item_icon">
                <FaTemperatureFull size={30} />
                <BsArrowRightShort size={25} />
              </div>

              <div className="item_name">
                <span>Nhiệt độ</span>
              </div>
            </div>

            <div className="item bg-[#edc74c]">
              <div className="item_icon">
                <WiHumidity size={30} />
                <BsArrowRightShort size={25} />
              </div>

              <div className="item_name">
                <span>Độ ẩm</span>
              </div>
            </div>

            {/* <div className="item bg-[#f0966b]">
              <div className="item_icon">
                <FaTemperatureFull size={30} />
                <BsArrowRightShort size={25} />
              </div>

              <div className="item_name">
                <span>Waiting...</span>
              </div>
            </div>

            <div className="item bg-[#68c8e4]">
              <div className="item_icon">
                <FaTemperatureFull size={30} />
                <BsArrowRightShort size={25} />
              </div>

              <div className="item_name">
                <span>Waiting...</span>
              </div>
            </div> */}
          </div>
        </div>

        {members.length > 0 ? (
          <div className="container">
            <div className="title">
              <h5>Thành viên</h5>
              <a href="/member">
                <BsArrowRightShort size={25} />
              </a>
            </div>
            <div className="members">
              {members.map((member, index) => {
                return (
                  <div className="member" key={index}>
                    <Image
                      src={member.gender == 0 ? Man : Woman}
                      alt={"Avatar"}
                      className="avatar"
                    />
                    <h5>{member.first_name}</h5>
                    <h4>{member.role == 2 ? "Admin" : "Full Access"}</h4>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}
      </MobileLayout>
    </div>
  );
}
