import DashboardModel from "@/models/DashboardModel";
import { observer } from "mobx-react-lite";
import { AddIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
  Center,
  Input,
  FormControl,
  FormLabel,
  NumberInput,
  NumberInputField,
  InputRightElement,
  InputGroup,
  Text,
} from "@chakra-ui/react";

const DashboardAddFrequency = observer(
  (props: { model: typeof DashboardModel }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();

    return (
      <>
        <Center marginRight={"5px"}>
          <AddIcon cursor="pointer" onClick={onOpen} />
        </Center>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Add New Frequency</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <FormControl>
                <FormLabel>Frequency</FormLabel>
                <NumberInput>
                  <InputGroup>
                    <NumberInputField />
                    <InputRightElement width="4.5rem">MHz</InputRightElement>
                  </InputGroup>
                </NumberInput>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button onClick={onClose} mr={3}>
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
  }
);

export default DashboardAddFrequency;
