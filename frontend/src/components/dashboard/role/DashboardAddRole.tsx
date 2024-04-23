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
} from "@chakra-ui/react";
import { useDisclosure, Button } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import DashboardModel from "@/models/DashboardModel";
import { AddIcon } from "@chakra-ui/icons";

const DashboardAddRole = observer((props: { model: typeof DashboardModel }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [value, setValue] = useState("1");

  return (
    <>
      <Center marginRight={"5px"}>
        <AddIcon cursor="pointer" onClick={onOpen} />
      </Center>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add role</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <RadioGroup onChange={setValue} value={value}>
              <Stack direction="row">
                <Radio value="1">ATC</Radio>
                <Radio value="2">PILOT</Radio>
              </Stack>
            </RadioGroup>
            <FormControl>
              <FormLabel>Role name</FormLabel>
              <Input placeholder="Enter role name" />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="red" onClick={onClose} mr={3}>
              Cancel
            </Button>
            <Button colorScheme="green" onClick={onClose}>
              Save
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
});

export default DashboardAddRole;