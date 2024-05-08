// src/components/RoleCard.tsx
"use client";
import {
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
  PopoverAnchor,
} from "@chakra-ui/react";
import { model } from "@/models/Model";
import { Box, Button, Center, Text, VStack } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import toast from "react-hot-toast";
import { LegacyRef, useEffect, useRef, useState } from "react";
import { log } from "console";
import { Call } from "@/types";

interface RoleCardProps {
  roleName: string;
  onClick: () => void;
  callable: boolean;
  model: typeof model;
}

const RoleCard: React.FC<RoleCardProps> = observer(function ({
  roleName,
  onClick,
  callable,
  model,
}) {
  // Split the roleName into the first word and the rest
  const firstSpaceIndex = roleName.indexOf(" ");
  const firstWord = roleName.substring(0, firstSpaceIndex);
  const restOfName = roleName.substring(firstSpaceIndex + 1);

  const [isCallMenuOpen, setIsCallMenuOpen] = useState(false);

  const [isAcceptMenuOpen, setIsAcceptMenuOpen] = useState(false);

  const ref = useRef(null);

  const openCallMenu = () => {
    setIsCallMenuOpen(true);
  };

  return (
    <Box w="6rem" h="6rem" p={2}>
      {/* Adjust w and h as per design */}
      <Center w="100%" h="100%">
        <Button
          ref={ref as any}
          onClick={callable ? openCallMenu : onClick}
          width="100%"
          height="100%"
        >
          <VStack>
            {/* Display the first word */}
            <Text fontSize="sm">{firstWord}</Text>
            {/* Display the rest of the name */}
            <Text fontSize="sm">{restOfName}</Text>
          </VStack>
        </Button>
      </Center>
      {callable && (
        <CallPopover
          model={model}
          anchorRef={ref}
          isOpen={isCallMenuOpen}
          onClose={() => {
            setIsCallMenuOpen(false);
          }}
          setOpen={setIsCallMenuOpen}
          roleName={roleName}
        />
      )}

      {callable && (
        <AcceptCallPopover
          model={model}
          anchorRef={ref}
          isOpen={isAcceptMenuOpen}
          onClose={() => setIsAcceptMenuOpen(false)}
          setOpen={setIsAcceptMenuOpen}
          roleName={roleName}
        />
      )}
    </Box>
  );
});

interface CallButtonProps {
  model: typeof model;
  anchorRef: LegacyRef<HTMLDivElement>;
  isOpen: boolean;
  onClose: () => void;
  setOpen: (bool: boolean) => void;
  roleName: string;
}

//Function that handles incoming calls and allow users to accept or decline calls
const AcceptCallPopover = observer((props: CallButtonProps) => {
  const { model, anchorRef, isOpen, onClose, setOpen, roleName } = props;

  const [call, setCall] = useState<Call | undefined>(undefined);

  //An effect hook that is triggered when the pendingcalls array is changed to handle incoming call notifications
  useEffect(() => {
    console.log("Pending calls", model.pendingCalls, roleName);
    const call = model.pendingCalls.find(
      (call) => call.initiatorRole == roleName
    );

    if (call) {
      console.log("Call found", call);
      if (call.isEmergency) {
        model.onMakeAcceptCall(call, true);
        model.pendingCalls = model.pendingCalls.filter((c) => c.id !== call.id);
        toast.error(`Incoming emergency call from ${call.initiatorRole}`);
        return;
      }
      toast.success(`Incoming call from ${call.initiatorRole}`);
      setCall(call);
      setOpen(true);
    } else {
      setOpen(false);
    }
  }, [model.pendingCalls]);

  const onSubmit = (isAccepted: boolean) => {
    if (call === undefined) return;
    model.onMakeAcceptCall(call, isAccepted);
    onClose();
  };

  //Renderes a popover that comes up when another role calls the user, with the option to accept or decline
  return (
    <Popover
      placement="bottom"
      isOpen={isOpen}
      onOpen={() => {}}
      onClose={() => {}}
    >
      <PopoverAnchor>
        <div ref={anchorRef}></div>
      </PopoverAnchor>

      <Portal>
        <PopoverContent>
          <PopoverArrow />
          <PopoverHeader>
            Incoming call from {call?.initiatorRole}
          </PopoverHeader>
          <PopoverBody>
            <Flex direction="row" gap="4">
              <Button
                bg="green"
                flex="1"
                onClick={() => {
                  onSubmit(true);
                }}
              >
                Accept
              </Button>
              <Button
                bg="red"
                flex="1"
                onClick={() => {
                  onSubmit(false);
                }}
              >
                Decline
              </Button>
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
});

//Function that allow users to call normally or emergency
const CallPopover = observer((props: CallButtonProps) => {
  const { model, anchorRef, isOpen, onClose, roleName } = props;

  const onMakeCall = (isEmergency: boolean) => {
    model.onMakeICCall(roleName, isEmergency);
    onClose();
  };

  //Renderes a popover with a title and two buttons, normal or emergency, that when pressed calls another role
  return (
    <Popover
      placement="bottom"
      isOpen={isOpen}
      onOpen={() => {}}
      onClose={onClose}
    >
      <PopoverAnchor>
        <div ref={anchorRef}></div>
      </PopoverAnchor>

      <Portal>
        <PopoverContent>
          <PopoverArrow />
          <PopoverCloseButton />
          <PopoverHeader>Choose call type</PopoverHeader>
          <PopoverBody>
            <Flex direction="row" gap="4">
              <Button
                bg="green"
                flex="1"
                onClick={() => {
                  onMakeCall(false);
                }}
              >
                Normal
              </Button>
              <Button
                bg="red"
                flex="1"
                onClick={() => {
                  onMakeCall(true);
                }}
              >
                Emergency
              </Button>
            </Flex>
          </PopoverBody>
        </PopoverContent>
      </Portal>
    </Popover>
  );
});

export default RoleCard;
