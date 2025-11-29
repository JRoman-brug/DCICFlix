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
    message: string;
    buttonContent: ReactNode;  
    handler: () => void | Promise<void>;
}

export default function ConfirmModal({
    message,
    buttonContent,
    handler,
    }: ConfirmModalProps) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <>
        <button onClick={onOpen} className="bg-transparent">
            {buttonContent}
        </button>

        <Modal
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            backdrop="blur"
            classNames={{
            base: "bg-black text-white",
            }}
        >
            <ModalContent>
            {(onClose) => (
                <>
                <ModalHeader>{message}</ModalHeader>

                <ModalFooter className="flex justify-between">
                    <Button className="bg-white text-black" onPress={onClose}>
                    Cancel
                    </Button>

                    <Button
                    className="bg-dcicflix text-black"
                    onPress={async () => {
                        await handler();
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
