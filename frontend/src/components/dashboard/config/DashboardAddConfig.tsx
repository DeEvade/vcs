import DashboardModel from "@/models/DashboardModel";
import { observer } from "mobx-react-lite";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  Center,
  FormControl,
  FormLabel,
  Input,
} from "@chakra-ui/react";
import { AddIcon } from "@chakra-ui/icons";
import { useState } from "react";
const DashboardAddConfig = observer(
  (props: { model: typeof DashboardModel }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { model } = props;
    const [name, setName] = useState<string>("");

    const handleClose = () => {
      onClose();
      setName("");
    };

    const handleSubmit = () => {
      model.addConfig(name);
      handleClose();
    };

    return (
      <>
        <Center marginRight={"5px"}>
          <AddIcon cursor="pointer" onClick={onOpen} />
        </Center>
        <Modal isOpen={isOpen} onClose={handleClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Config</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl isRequired>
                <FormLabel>Name</FormLabel>
                <Input
                  type="name"
                  value={name}
                  placeholder="Enter config name"
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button onClick={handleClose} mr={3}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={() => {
                  handleSubmit();
                }}
                isDisabled={!name.trim()}
              >
                Save
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    );
  }
);

export default DashboardAddConfig;
