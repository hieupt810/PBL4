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

interface ModalComponentProps {
  icon: JSX.Element;
  name: string;
  title: string;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddMember: () => void;
}

export default function ModalComponent({
  icon,
  name,
  title,
  handleInputChange,
  handleAddMember,
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
      <Modal
        backdrop={backdrop}
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        placement="top-center"
      >
        <ModalContent className="flex self-center">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
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
    </>
  );
}
