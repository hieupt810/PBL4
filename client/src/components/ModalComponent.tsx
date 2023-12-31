import React, { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  useDisclosure,
  Checkbox,
  Input,
  Link,
} from "@nextui-org/react";
import { FiUploadCloud } from "react-icons/fi";
import { ChangeEvent } from "react";
import Image from "next/image";
import { useAppDispatch } from "@/hook/hook";
import { failPopUp } from "@/hook/features/PopupSlice";
interface ModalComponentProps {
  icon: JSX.Element;
  name: string;
  title: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddMember: () => void;
  handleAddFile: (images: File[] | null) => void;
}

export default function ModalComponent({
  icon,
  name,
  title,
  handleInputChange,
  handleAddMember,
  handleAddFile,
}: ModalComponentProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [backdrop, setBackdrop] = useState<
    "blur" | "transparent" | "opaque" | undefined
  >("blur");

  const handleOpen = (
    backdrop: "blur" | "transparent" | "opaque" | undefined
  ) => {
    setBackdrop(backdrop);
    onOpen();
  };
  const [image, setImage] = useState<File | null>(null);
  const [images, setImages] = useState<File[]>([]);
  const [imageURLs, setImageURLs] = useState<string[]>([]);
  const [createObjectURL, setCreateObjectURL] = useState<string>();
  const [error, setError] = useState<string | null>(null);
  const dispatch = useAppDispatch();


  const uploadToClient = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const newImages = Array.from(event.target.files);
      setImages(newImages);

      // Tạo URL đối tượng cho mỗi hình ảnh được tải lên
      const newImageURLs = newImages.map((image) => URL.createObjectURL(image));
      setImageURLs(newImageURLs);
    }
  };

  const handleAddMemberWithValidation = () => {
    if (images.length === 0) {
      setError("Vui lòng tải lên ít nhất một hình ảnh");
      dispatch(failPopUp("E006"));
      return;
    }
    // Pass danh sách ảnh vào hàm xử lý thêm thành viên
    handleAddFile(images);
    setImages([]);
    setError(null);
  };

  const resetImages = () => {
    setImages([]);
    setImageURLs([]);
    setError(null);
  };
  console.log(images);

  return (
    <>
      <Button
        onPress={() => handleOpen("blur")}
        variant="flat"
        color="primary"
        className="capitalize"
      >
        {icon}
      </Button>
      {title === "Add member" ? (
        <Modal
          backdrop={backdrop}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          placement="top-center"
        >
          <ModalContent className="flex self-center">
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {title}
                </ModalHeader>
                <ModalBody>
                  <Input
                    isRequired
                    autoFocus
                    label="Username"
                    placeholder="Enter your email"
                    variant="bordered"
                    onChange={handleInputChange}
                  />
                </ModalBody>
                <ModalFooter>
                  <Button color="danger" variant="flat" onPress={onClose}>
                    Close
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => {
                      handleAddMember();
                      onClose();
                    }}
                  >
                    {name}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      ) : (
        <Modal
          backdrop={backdrop}
          isOpen={isOpen}
          onOpenChange={onOpenChange}
          placement="top-center"
        >
          <ModalContent className="flex self-center">
            {(onClose) => (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  {title}
                </ModalHeader>
                <ModalBody>
                  <div className="inputWrap w-96">
                    <label htmlFor="description" className="inputLabel">
                      <span>Ảnh</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <div>
                      {imageURLs.map((url, index) => (
                        <Image
                          key={index}
                          alt={`Image ${index + 1}`}
                          src={url}
                          width={250}
                          height={250}
                          className="object-contain rounded-xl shadow-lg z-50"
                          priority
                        />
                      ))}
                      {imageURLs.length === 0 && <p>No image available</p>}
                    </div>
                    <div>
                      <label
                        htmlFor="image"
                        className="flex items-center justify-center w-32 h-10 bg-[#c7c4bd] text-white rounded-lg shadow-md cursor-pointer hover:bg-opacity-80"
                      >
                        <FiUploadCloud size={25} color="black" />
                        <input
                          onChange={uploadToClient}
                          type="file"
                          id="image"
                          name="files"
                          accept="image/*"
                          multiple
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="h-4">
                      {error ? <p className="errorMessage">{error}</p> : null}
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button
                    color="danger"
                    variant="flat"
                    onPress={() => {
                      onClose();
                      resetImages();
                    }}
                  >
                    Close
                  </Button>
                  <Button
                    color="primary"
                    onClick={() => {
                      handleAddMemberWithValidation();
                      onClose();
                      resetImages();
                    }}
                  >
                    {name}
                  </Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      )}
    </>
  );
}
