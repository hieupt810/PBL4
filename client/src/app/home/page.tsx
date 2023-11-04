"use client";
import ConfirmPopup from "@/components/ConfirmPopup";
import { failPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch } from "@/hook/hook";
import { Member } from "@/models/member";
import Man from "@/static/man.jpg";
import Woman from "@/static/woman.png";
import { Avatar, Button, Skeleton, AvatarGroup } from "@nextui-org/react";
import { deleteCookie, getCookie, hasCookie } from "cookies-next";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { BsArrowRightShort } from "react-icons/bs";
import { FaTemperatureFull } from "react-icons/fa6";
import { FiEdit, FiLogOut, FiRefreshCcw } from "react-icons/fi";
import { WiHumidity } from "react-icons/wi";
import MobileLayout from "../mobile";
import "./styles.css";
import LightComponent from "@/components/LightComponent";
import { Light } from "../types/light.type";
import http from "../utils/http";
import io from "socket.io-client";
import { useFetchLights } from "./fetchData/useFetchLights";
import DoorComponent from "@/components/DoorComponent";
import classNames from "classnames";

interface ConfirmPopupProps {
  text: string;
  onConfirm: () => void;
}

export default function HomeInformation() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [temperature, setTemperature] = useState(null);
  const [humidity, setHumidity] = useState(null);

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<Member>();
  const [members, setMembers] = useState<Member[]>([]);
  const [confirmPopup, setConfirmPopup] = useState<ConfirmPopupProps>({
    text: "",
    onConfirm: () => {},
  });

  const [lights, setLights] = useState<Light[]>([]);
  const lightList = Array.isArray(lights) ? lights : [];
  console.log(lights);

  useEffect(() => {
    const socket1 = io("http://localhost:5005");

    if (!hasCookie("token")) {
      router.push("/login");
      return;
    }
    const token = getCookie("token")?.toString();
    fetch(process.env.BACKEND_URL + "api/user", {
      method: "GET",
      headers: {
        token: `${token}`,
      },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.status == 200) setUser(d.profile);
        else dispatch(failPopUp(d.message));
      });

    fetch(process.env.BACKEND_URL + "api/home/list-member", {
      method: "GET",
      headers: {
        token: `${token}`,
      },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.status == 200) {
          setMembers(d.members);
        } else dispatch(failPopUp(d.message));
      });

    const socket = io("http://localhost:5005");

    socket.on("temperature", (data) => {
      setTemperature(data.temperature);
    });

    socket.on("humidity", (data) => {
      setHumidity(data.humidity);
    });

    return () => {
      socket.off("temperature");
      socket.off("humidity");
      socket.close();
    };
  }, [dispatch, router]);

  useFetchLights(setLights, setLoading);

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

          <Link href={"/reset_password"}>
            <Button isIconOnly color="primary">
              <FiRefreshCcw size={20} />
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
          <h5>Trạng thái</h5>

          <div className="items_container">
            <div className="item bg-[#7443eb]">
              <div className="item_icon">
                <FaTemperatureFull size={30} />
                {/* <BsArrowRightShort size={25} /> */}
                <span>
                  {temperature ? `${temperature}°C` : "Waiting for data..."}
                </span>
              </div>

              <div className="item_name">
                <span>Nhiệt độ</span>
              </div>
            </div>

            <div className="item bg-[#edc74c]">
              <div className="item_icon">
                <WiHumidity size={30} />
                <span>{humidity ? `${humidity}%` : "Waiting for data..."}</span>
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

        <div className="text-xl font-bold flex items-center justify-between">
          <h5>Thành viên</h5>
          {members.length > 0 && (
            <a href="/member" className="text-blue-500 hover:text-blue-700">
              <BsArrowRightShort size={25} />
            </a>
          )}
        </div>

        {members.length > 0 ? (
          <div>
            <AvatarGroup isBordered>
              {members.map((member, index) => (
                <Avatar src={member.gender === 0 ? Man.src : Woman.src} key={index} />
              ))}
            </AvatarGroup>
          </div>
        ) : (
          // <div className="container drop-shadow-xl rounded-lg">
          //   <div className="members">
          //     {members.map((member, index) => {
          //       return (
          //         <div className="member" key={index}>
          //           <Image
          //             src={member.gender == 0 ? Man : Woman}
          //             alt={"Avatar"}
          //             className="avatar"
          //           />
          //           <h5>{member.first_name}</h5>
          //           <h4>{member.role == 2 ? "Admin" : "Full Access"}</h4>
          //         </div>
          //       );
          //     })}
          //   </div>
          // </div>
          <div className="max-w-[300px] w-full flex items-center gap-3">
            <div>
              <Skeleton className="flex rounded-full w-12 h-12" />
            </div>
            <div className="w-full flex flex-col gap-2">
              <Skeleton className="h-3 w-3/5 rounded-lg" />
              <Skeleton className="h-3 w-4/5 rounded-lg" />
            </div>
            <div>
              <Skeleton className="flex rounded-full w-12 h-12" />
            </div>
            <div className="w-full flex flex-col gap-2">
              <Skeleton className="h-3 w-3/5 rounded-lg" />
              <Skeleton className="h-3 w-4/5 rounded-lg" />
            </div>
          </div>
        )}

        <div className="container">
          <h5>Thiết bị của tôi</h5>
          <div suppressHydrationWarning={true}>
            {loading ? (
              <Fragment>
                <div className="max-w-[300px] w-full flex items-center gap-3 mb-3">
                  <div>
                    <Skeleton className="flex rounded-full w-12 h-12" />
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    <Skeleton className="h-3 w-3/5 rounded-lg" />
                    <Skeleton className="h-3 w-4/5 rounded-lg" />
                  </div>
                  <div>
                    <Skeleton className="flex rounded-full w-12 h-12" />
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    <Skeleton className="h-3 w-3/5 rounded-lg" />
                    <Skeleton className="h-3 w-4/5 rounded-lg" />
                  </div>
                </div>
                <div className="max-w-[300px] w-full flex items-center gap-3 mb-3">
                  <div>
                    <Skeleton className="flex rounded-full w-12 h-12" />
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    <Skeleton className="h-3 w-3/5 rounded-lg" />
                    <Skeleton className="h-3 w-4/5 rounded-lg" />
                  </div>
                  <div>
                    <Skeleton className="flex rounded-full w-12 h-12" />
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    <Skeleton className="h-3 w-3/5 rounded-lg" />
                    <Skeleton className="h-3 w-4/5 rounded-lg" />
                  </div>
                </div>
                <div className="max-w-[300px] w-full flex items-center gap-3 mb-3">
                  <div>
                    <Skeleton className="flex rounded-full w-12 h-12" />
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    <Skeleton className="h-3 w-3/5 rounded-lg" />
                    <Skeleton className="h-3 w-4/5 rounded-lg" />
                  </div>
                  <div>
                    <Skeleton className="flex rounded-full w-12 h-12" />
                  </div>
                  <div className="w-full flex flex-col gap-2">
                    <Skeleton className="h-3 w-3/5 rounded-lg" />
                    <Skeleton className="h-3 w-4/5 rounded-lg" />
                  </div>
                </div>
              </Fragment>
            ) : (
              <>
                <DoorComponent name="Door" />
                {lightList.map((light) => (
                  <LightComponent
                    key={light.id}
                    name={light.name}
                    id={light.id}
                  />
                ))}
              </>
            )}
          </div>
        </div>
      </MobileLayout>
    </div>
  );
}
