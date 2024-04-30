import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Center,
  Input,
  Radio,
  RadioGroup,
  Stack,
  FormControl,
  FormLabel,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useDisclosure, Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import DashboardModel from "@/models/DashboardModel";
import { AddIcon } from "@chakra-ui/icons";
import { Socket } from "socket.io";

const DashboardAddRole = observer((props: { model: typeof DashboardModel }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = useState<"ATC" | "pilot">("ATC");
  const [role, setRole] = useState("");

  const { model } = props;

  const handleSave = () => {
    model.addRole({
      type: value,
      name: role,
      configurationId: model.selectedConfigurationId!,
    });
    onClose();
  };

  useEffect(() => {
    if (!isOpen) {
      console.log("Effekt test");
      setRole("");
    }
  }, [isOpen]);

  return (
    <>
      <Center marginRight={"5px"}>
        <AddIcon cursor="pointer" onClick={onOpen} />
      </Center>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Role</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <RadioGroup
              onChange={setValue as any}
              value={value}
              paddingBottom="5px"
            >
              <Stack direction="row">
                <Radio value="ATC">ATC</Radio>
                <Radio value="pilot">PILOT</Radio>
              </Stack>
            </RadioGroup>
            <FormControl isRequired>
              <FormLabel>Role name</FormLabel>
              <Input
                onChange={(e) => {
                  setRole(e.target.value);
                }}
                placeholder="Enter role name"
                value={role}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSave}
              isDisabled={!role.trim()}
            >
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});

export default DashboardAddRole;
