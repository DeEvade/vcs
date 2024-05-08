import DashboardModel, {
  DashboardConfiguration,
} from "@/models/DashboardModel";
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
  FormErrorMessage,
} from "@chakra-ui/react";
import { EditIcon } from "@chakra-ui/icons";
import { useEffect, useState } from "react";

// Component for editing an existing configuration, providing a modal form for input and submission
const DashboardEditConfig = observer(
  (props: { model: typeof DashboardModel }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    const { model } = props;

    useEffect(() => {
      const config = model.configs?.find(
        (c) => c.id == model.selectedConfigurationId
      );
      if (config) {
        setName(config.name);
        setOriginalName(config.name);
      }
    }, [model.selectedConfigurationId]);

    const [name, setName] = useState<string>("");
    const [originalName, setOriginalName] = useState<string>("");

    const handleClose = () => {
      onClose();
      setName(originalName);
    };

    const handleSubmit = () => {
      model.editConfig(name);
      setOriginalName(name);
      onClose();
    };

    // Renders a button with an edit icon that triggers a modal form for editing an existing configuration
    return (
      <>
        <Center marginRight={"5px"}>
          <EditIcon cursor="pointer" onClick={onOpen} />
        </Center>
        <Modal isOpen={isOpen} onClose={handleClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Edit Config</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl isRequired isInvalid={!name.trim()}>
                <FormLabel>Name</FormLabel>
                <Input
                  type="name"
                  value={name}
                  placeholder="Enter config name"
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                />
                <FormErrorMessage>
                  Configuration name is required!
                </FormErrorMessage>
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

export default DashboardEditConfig;
