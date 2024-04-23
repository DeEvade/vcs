import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Center,
  Text,
} from "@chakra-ui/react";
import { useDisclosure, Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import DashboardModel from "@/models/DashboardModel";
import { AddIcon } from "@chakra-ui/icons";

const DashboardDeleteCard = observer(
  (props: { model: typeof DashboardModel; name: string; cardType: string }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [value, setValue] = useState("ATC");

    return (
      <>
        <Button cursor="pointer" onClick={onOpen}>
          Delete
        </Button>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Delete {props.cardType}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Text>
                Are you sure you want to delete {props.cardType.toLowerCase()}:{" "}
                {props.name}
              </Text>
            </ModalBody>

            <ModalFooter>
              <Button onClick={onClose} mr={3}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={onClose}>
                Delete
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  }
);

export default DashboardDeleteCard;
