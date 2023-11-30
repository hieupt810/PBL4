import http from "@/app/utils/http";
import { failPopUp, successPopUp } from "@/hook/features/PopupSlice";
import { useAppDispatch } from "@/hook/store";
import { Member } from "@/models/member";
import { Link, User } from "@nextui-org/react";
import { getCookie } from "cookies-next";
import { StaticImageData } from "next/image";
import { BsCaretLeft, BsTrash } from "react-icons/bs";
import {
  SwipeAction,
  SwipeableList,
  SwipeableListItem,
  TrailingActions,
} from "react-swipeable-list";
interface ListMember {
  value: Member;
  Man: StaticImageData;
  Woman: StaticImageData;
}

export function MemberComponent({ value, Man, Woman }: ListMember) {
  const dispatch = useAppDispatch();
  const handleDelete = async () => {
    const data = {
      username: value.username,
    };
    try {
      const response = await http.delete(
        `api/home/delete-member?username=${data}`,
        {
          headers: {
            Authorization: `${getCookie("token")?.toString()}`,
          },
        }
      );
      const result = await response.data;
      console.log(result);
      if (result.status == 200) {
        dispatch(successPopUp(result.message));
      } else if (result.status != 200) {
        dispatch(failPopUp(result.message));
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <SwipeableList>
      {value.role === 2 ? (
        <div className="mb-5">
          <SwipeableListItem>
            <div className="flex items-center justify-between p-4 border rounded-lg shadow-xl">
              <User
                name={
                  <div className="flex items-center">
                    {`${value.last_name} ${value.first_name}`}
                    <h4 className="text-xs text-gray-600 text-opacity-50 ml-2 mr-2">
                      Quản trị viên
                    </h4>
                  </div>
                }
                description={
                  <Link
                    href="https://www.facebook.com/khacduoc.thai.1"
                    size="sm"
                    isExternal
                  >
                    @{value.username}
                  </Link>
                }
                avatarProps={{
                  src: value.gender === 0 ? Man.src : Woman.src,
                  className: "border border-gray-300",
                }}
              />
            </div>
          </SwipeableListItem>
        </div>
      ) : (
        <SwipeableListItem
          trailingActions={
            <TrailingActions>
              <SwipeAction destructive onClick={handleDelete}>
                {null}
              </SwipeAction>
            </TrailingActions>
          }
        >
          <div className="flex items-center justify-between p-4 border rounded-lg shadow-xl">
            <User
              name={`${value.last_name} ${value.first_name}`}
              description={
                <Link
                  href="https://www.facebook.com/khacduoc.thai.1"
                  size="sm"
                  isExternal
                >
                  @{value.username}
                </Link>
              }
              avatarProps={{
                src: value.gender === 0 ? Man.src : Woman.src,
                className: "border border-gray-300",
              }}
            />
            <div className="flex space-x-0.5">
              <div className="flex items-center">
                <BsCaretLeft size={15} className="text--500" />
              </div>
              <BsTrash size={20} className="text--500" />
            </div>
          </div>
        </SwipeableListItem>
      )}
    </SwipeableList>
  );
}
