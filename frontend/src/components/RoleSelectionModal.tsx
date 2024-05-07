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
  Spinner,
} from "@chakra-ui/react";
import RolesGrid from "./RolesGrid";
import { model as baseModel } from "@/models/Model";
import { observer } from "mobx-react-lite";
import { Role } from "@/types";

interface RoleSelectionModalProps {
  isOpen: boolean;
  model: typeof baseModel;
}

const RoleSelectionModal: React.FC<RoleSelectionModalProps> = observer(
  function ({ isOpen, model }) {
    const setSelectedRole = (role: string) => {
      model.addSelectedRole(role);
    };
    const [atcoSelected, setAtcoSelected] = useState(false);
    const atcoButtonColor = useColorModeValue("green", "teal");
    const bgColor = useColorModeValue("gray.100", "gray.700");

    const onClose = () => {
      model.setOpenRoleModal(false);
    };

    const handleATCOSelection = () => {
      setAtcoSelected(true);
    };

    const handlePilotSelection = (role: Role) => {
      setSelectedRole(role.name);
      onClose();
    };

    const handleRoleSelection = (roleName: string) => {
      setSelectedRole(roleName);
      onClose();
    };

    if (!model.configuration) return null;

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
                {model.configuration == null ? (
                  <Spinner />
                ) : (
                  <>
                    <Button
                      colorScheme={atcoSelected ? atcoButtonColor : undefined}
                      onClick={handleATCOSelection}
                      w="6rem"
                      h="4rem"
                      p={2}
                    >
                      ATCO
                    </Button>
                    {model.configuration.roles
                      .filter(
                        (role) => !model.selectedRoles.includes(role.name)
                      )

                      .filter((role) => role.type === "pilot")
                      .map((role) => (
                        <Button
                          key={role.id}
                          w="6rem"
                          h="4rem"
                          p={2}
                          onClick={() => {
                            handlePilotSelection(role);
                          }}
                        >
                          {role.name}
                        </Button>
                      ))}
                  </>
                )}
              </HStack>
            </VStack>
            {atcoSelected && (
              <RolesGrid
                model={model}
                onSelectRole={handleRoleSelection}
                callable={false}
                acceptCall={false}
                toSelectedRole={() => {}}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    );
  }
);

export default RoleSelectionModal;
