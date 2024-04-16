// src/components/RoleSelectionModal.tsx
import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  Button,
  HStack,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";
import RolesGrid from "./RolesGrid";
import { model as baseModel } from "@/models/Model";
import { observer } from "mobx-react-lite";

interface RoleSelectionModalProps {
  isOpen: boolean;
  model: typeof baseModel;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = observer(
  function ({ isOpen, model }) {
    const setSelectedRole = (role: string) => {
      model.setSelectedRole(role);
    };
    const [atcoSelected, setAtcoSelected] = useState(false);
    const atcoButtonColor = useColorModeValue("green", "teal");

    const onClose = () => {
      model.setOpenRoleModal(false);
    };

    const handleATCOSelection = () => {
      setAtcoSelected(true);
    };

    const handlePilotSelection = () => {
      setSelectedRole("PILOT");
      onClose();
    };

    const handleRoleSelection = (roleName: string) => {
      setSelectedRole(roleName);
      onClose();
    };

    useEffect(() => {
      console.log("selected role: ", model.selectedRole);
    }, [model.selectedRole]);

    return (
      <Modal
        isOpen={isOpen}
        onClose={() => {}}
        isCentered
        motionPreset="slideInBottom"
      >
        <ModalOverlay />
        <ModalContent
          mx={4} // Margin on the x-axis for smaller screens
          width="60%" // A fixed width for all screen sizes
          height="60vh" // A fixed height based on viewport height
          sx={{
            minWidth: "60vh", // Ensures modal has a minimum width regardless of content
            minHeight: "30vh", // Ensures modal has a minimum height regardless of content
          }}
        >
          <ModalHeader>Select Role</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <HStack spacing={4} marginBottom="2rem">
                <Button
                  colorScheme={atcoSelected ? atcoButtonColor : undefined}
                  onClick={handleATCOSelection}
                  w="6rem"
                  h="4rem"
                  p={2}
                >
                  ATCO
                </Button>
                <Button w="6rem" h="4rem" p={2} onClick={handlePilotSelection}>
                  PILOT
                </Button>
              </HStack>
            </VStack>
            {atcoSelected && <RolesGrid onSelectRole={handleRoleSelection} />}
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
);

export default RoleSelectionModal;
