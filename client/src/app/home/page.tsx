"use client";
import Popup from "@/component/Popup";
import TranslateCode from "@/language/translate";
import Man from "@/static/man.jpg";
import Woman from "@/static/woman.png";
import { deleteCookie, getCookie } from "cookies-next";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { BsArrowRightShort } from "react-icons/bs";
import { FaTemperatureFull } from "react-icons/fa6";
import { FiEdit } from "react-icons/fi";
import { GrLogout } from "react-icons/gr";
import { TbHomePlus } from "react-icons/tb";
import { WiHumidity } from "react-icons/wi";
import "./home.css";

interface Member {
  first_name: string;
  gender: number;
  role: number;
}

interface PopupProps {
  type?: "success" | "failed";
  text: string;
}

export default function HomeInformation() {
  const router = useRouter();

  const [members, setMembers] = useState<Member[]>([]);
  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [popup, setPopup] = useState<PopupProps>({ text: "" });

  useEffect(() => {
    const token = getCookie("token") as string;

    if (!token) {
      router.push("/login");
      return;
    }

    fetch(process.env.BACKEND_URL + `/api/auth?token=${token}`, {
      method: "GET",
    })
      .then((r) => {
        if (!r.ok)
          setPopup({ text: TranslateCode("VI", "E001"), type: "failed" });
        return r.json();
      })
      .then((d) => {
        if (d.status == 200) {
          setName(d.profile["last_name"] + " " + d.profile["first_name"]);
          setUsername(d.profile["username"]);
        } else router.push("/");
      });

    fetch(process.env.BACKEND_URL + `/api/home?token=${token}`, {
      method: "GET",
    })
      .then((r) => {
        if (!r.ok)
          setPopup({ text: TranslateCode("VI", "E001"), type: "failed" });
        return r.json();
      })
      .then((d) => {
        if (d.status == 200) {
          setMembers(d.members);
        }
      });
  }, [router]);

  return (
    <div>
      <Popup
        type={popup.type}
        text={popup.text}
        close={() => {
          setPopup({ text: "", type: undefined });
        }}
      />

      <main>
        {username && name ? (
          <div className="user_container">
            <div className="user__name">
              <h5>Xin chào, {name}!</h5>
              <h4>@{username}</h4>
            </div>
          </div>
        ) : (
          <div className="user_container">
            <div className="user__name animate-pulse space-y-1">
              <div className="bg-gray-300 w-36 h-6 animate-pulse rounded-md"></div>
              <div className="flex flex-row space-x-1">
                <span>@</span>
                <div className="bg-gray-200 w-full h-6 animate-pulse rounded-md"></div>
              </div>
            </div>
          </div>
        )}

        <div className="home__button">
          <a href="/create/home">
            <TbHomePlus size={20} />
          </a>

          <a href="/profile">
            <FiEdit size={20} />
          </a>

          <button
            type="button"
            onClick={() => {
              deleteCookie("token");
              router.push("/");
            }}
          >
            <GrLogout size={20} />
          </button>
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
              <div>
                <BsArrowRightShort size={25} />
              </div>
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
      </main>
    </div>
  );
}
