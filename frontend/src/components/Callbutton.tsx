import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { model as baseModel } from "@/models/Model";
import { Frequency, XC } from "@/types";
import { useState } from "react";
import {
  Box,
  Button,
  Text,
  Grid,
  GridItem,
  useColorMode,
  PopoverTrigger,
  Portal,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverCloseButton,
  PopoverBody,
  PopoverFooter,
  Popover,
  Stack,
  Flex,
  Checkbox,
  useDisclosure,
} from "@chakra-ui/react";
import { rolesToFrequencies } from "@/utils/tools";
import toast from "react-hot-toast";

interface Props {
  roleName: string;
  model: typeof baseModel;
  triggerRef: React.LegacyRef<HTMLButtonElement>;
}

const Callbutton = observer((props: Props) => {
  const { roleName, model, triggerRef } = props;
  const { onOpen, onClose, isOpen } = useDisclosure();
  const [callIntialized, setCallIntialized] = useState(false);

  const onMakeCall = (isEmergency: boolean) => {
    model.onMakeICCall(roleName, isEmergency);
    setCallIntialized(true);
    onClose();
  };

  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
      <Portal>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverBody>
            <Stack spacing={4}>
              <Button onClick={() => onMakeCall(false)} colorScheme={"blue"}>
                Call
              </Button>
              <Button onClick={() => onMakeCall(true)} colorScheme={"red"}>
                Emergency
              </Button>
            </Stack>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
});

const AcceptICCallbutton = observer((props: Props) => {
  const { roleName, model, triggerRef } = props;
  const { onOpen, onClose, isOpen } = useDisclosure();

  const onMakeAcceptCall = (isAccepted: boolean) => {
    model.onMakeAcceptCall(roleName, isAccepted);
    onClose();
  };

  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
      {/*<PopoverTrigger>{triggerRef}</PopoverTrigger>*/}
      <Portal>
        <PopoverContent>
          <PopoverArrow />
          <PopoverHeader>
            {roleName} is calling you. Do you want to accept the call?
          </PopoverHeader>
          <PopoverCloseButton />
          <PopoverBody>
            <Button onClick={() => onMakeAcceptCall(false)} colorScheme={"red"}>
              Reject
            </Button>
            <Button
              onClick={() => onMakeAcceptCall(true)}
              colorScheme={"green"}
            >
              Accept
            </Button>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
});

export default Callbutton;
