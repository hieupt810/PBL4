import React from "react";
import { User, Link } from "@nextui-org/react";
import { Member } from "@/models/member";
import { StaticImageData } from "next/image";

interface ListMember {
  value: Member;
  Man: StaticImageData;
  Woman: StaticImageData;
}

export function MemberComponent({ value, Man, Woman }: ListMember) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg shadow-xl">
      <User
        name={
          <div className="flex items-center">
            {`${value.last_name} ${value.first_name}`}
            {value.role === 2 ? (
              <h4 className="text-xs text-gray-600 text-opacity-50 ml-2 mr-2">Quản trị viên</h4>
            ) : null}
          </div>
        }
        description={
          <Link href="https://www.facebook.com/khacduoc.thai.1" size="sm" isExternal>
            @{value.username}
          </Link>
        }
        avatarProps={{
          src: value.gender === 0 ? Man.src : Woman.src,
        }}
      />
    </div>
  );
}
