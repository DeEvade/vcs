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
import DashboardModel, { DashboardRole } from "@/models/DashboardModel";
import { AddIcon } from "@chakra-ui/icons";

const DashboardDeleteCard = observer(
  (props: {
    model: typeof DashboardModel;
    id: number;
    name: string;
    type: string;
    cardType: string;
  }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [value, setValue] = useState<"ATC" | "pilot">("ATC");
    const { model } = props;

    const handleDelete = () => {
      switch (props.type) {
        case "role":
          model.deleteRole(props.id);
          break;
        case "config":
          //model.deleteConfig(props.id);
          break;
        case "frequency":
          //model.deleteFrequency(props.id);
          break;
        default:
          break;
      }

      onClose();
    };

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
              <Button colorScheme="red" onClick={handleDelete}>
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
