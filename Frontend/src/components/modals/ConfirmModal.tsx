import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalFooter,
  Button,
  useDisclosure,
} from "@heroui/react";
import type { ReactNode } from "react";

interface ConfirmModalProps {
  title: string;
  message: string;
  messageButton?: string;
  iconButton?: ReactNode;
  handler: () => void;
}
function ConfirmModal({
  message,
  messageButton,
  iconButton,
  handler,
}: ConfirmModalProps) {
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  return (
    <>
      <Button onPress={onOpen} className="bg-transparent">
        {iconButton}
        {messageButton}
      </Button>
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        backdrop="blur"
        classNames={{
          base: "bg-black",
        }}
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>{message}</ModalHeader>
              <ModalFooter className="flex justify-between">
                <Button className="bg-white text-black" onPress={onClose}>
                  Close
                </Button>
                <Button
                  className="bg-dcicflix text-black"
                  onPress={() => {
                    handler();
                    onClose();
                  }}
                >
                  Confirm
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}

export default ConfirmModal;
