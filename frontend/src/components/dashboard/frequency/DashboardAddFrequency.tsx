import DashboardModel from "@/models/DashboardModel";
import { observer } from "mobx-react-lite";
import { AddIcon } from "@chakra-ui/icons";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

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
  FormErrorMessage,
} from "@chakra-ui/react";

const DashboardAddFrequency = observer(
  (props: { model: typeof DashboardModel }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [value, setValue] = useState("");
    const [frequency, setFrequency] = useState("");

    const { model } = props;

    const saveFrequency = () => {
      model.addFrequency({
        frequency: frequency,
        configurationId: model.selectedConfigurationId!,
      });
      onClose();
    };

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
              <FormControl isRequired>
                <FormLabel>Frequency</FormLabel>
                <NumberInput>
                  <InputGroup>
                    <NumberInputField
                      onChange={(e) => setFrequency(e.target.value)}
                      placeholder="Enter Frequency"
                      value={frequency}
                    />
                    <InputRightElement width="4.5rem">MHz</InputRightElement>
                  </InputGroup>
                </NumberInput>
              </FormControl>
            </ModalBody>

            <ModalFooter>
              <Button onClick={onClose} mr={3}>
                Cancel
              </Button>
              <Button
                colorScheme="green"
                onClick={saveFrequency}
                isDisabled={
                  !frequency.trim() ||
                  parseInt(frequency) < 1 ||
                  /[e+-]/.test(frequency)
                }
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

export default DashboardAddFrequency;
