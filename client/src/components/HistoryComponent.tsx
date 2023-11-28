// HistoryComponent.tsx
import React from "react";
import { User } from "@nextui-org/react";
import { SwipeableList, SwipeableListItem } from "react-swipeable-list";
import { History } from "@/app/types/history.type";
import {
  useDisclosure,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
} from "@nextui-org/react";
import { Image } from "@nextui-org/react";

interface HistoryList {
  value: History;
}

export function HistoryComponent({ value }: HistoryList) {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleClick = () => {
    onOpen();
  };

  return (
    <SwipeableList>
      <div className="mb-5" onClick={handleClick}>
        <SwipeableListItem>
          <div className="flex items-center justify-between p-4 border rounded-lg shadow-xl">
            <User
              name={
                <div className="flex items-center">
                  <h4
                    className={`text-xs ${
                      value.success ? "text-green-500" : "text-red-500"
                    } text-opacity-50 ml-2 mr-2`}
                  >
                    <span className="text-gray-600 text-opacity-60">{`@${value.username}`}</span>
                    {value.success
                      ? ` Đã yêu cầu mở cửa thành công vào lúc ${value.atTime}`
                      : ` Đã yêu cầu mở cửa thất bại vào lúc ${value.atTime}`}
                  </h4>
                </div>
              }
              avatarProps={{
                src: "https://mediamart.vn/images/uploads/2022/713193b6-a8b3-471d-ab04-c38dae2c1da4.jpg",
                className: "border border-gray-300",
              }}
            />
          </div>
        </SwipeableListItem>
      </div>

      {/* Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isDismissable={false}>
        <ModalContent className="flex self-center">
          <ModalHeader className="flex flex-col gap-1">Chi tiết</ModalHeader>
          <ModalBody>
            {value.imgUrl && (
              <Image
                width={300}
                alt="NextUI hero Image"
                src={`${process.env.BACKEND_URL}history/${value.imgUrl}`}
              />
            )}
            <h4
              className={`text-xs ${
                value.success ? "text-green-500" : "text-red-500"
              } text-opacity-50 ml-2 mr-2`}
            >
              <span className="text-gray-600 text-opacity-60">{`@${value.username}`}</span>
              {value.success
                ? ` Đã yêu cầu mở cửa thành công vào lúc ${value.atTime}`
                : ` Đã yêu cầu mở cửa thất bại vào lúc ${value.atTime}`}
            </h4>
          </ModalBody>
          <ModalFooter>
            <Button color="danger" variant="light" onClick={onClose}>
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </SwipeableList>
  );
}
