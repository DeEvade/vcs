// src/components/RolesGrid.tsx
import React from "react";
import {
  Box,
  Button,
  Flex,
  SimpleGrid,
  Spacer,
  useColorModeValue,
} from "@chakra-ui/react";
import RoleCard from "./RoleCard";
import { Role } from "@/types";
import { observer } from "mobx-react-lite";
import { model as basemModel } from "@/models/Model";
import Callbutton from "./Callbutton";
import AcceptICCallbutton from "./Callbutton";

interface RolesGridProps {
  onSelectRole: (roleName: string) => void; // Adding a new prop for role selection
  model: typeof basemModel;
  callable: boolean;
  acceptCall: boolean;
}

//Function that renderes a rolegrid configuration that allows users to select roles upon entering 
const RolesGrid: React.FC<RolesGridProps> = observer(function ({
  onSelectRole,
  model,
  callable,
  acceptCall,
}) {
  if (model.configuration === null) {
    return <>Awaiting configuration</>;
  }
  const roles: Role[] = model.configuration.roles
    .filter((role) => role.type === "ATC")
    .filter((role) => !model.selectedRoles.includes(role.name));

  //Renderes a rolecard with all possible roles, when a role is pressed it is selected by the user
  return (
    <Box>
      <SimpleGrid
        minChildWidth="4.4rem"
        spacing={4}
        boxShadow="md"
        border="1px"
        bg={useColorModeValue("gray.200", "gray.800")}
        borderColor="gray.500"
        padding="1rem"
        marginRight="2rem"
      >
        {roles.map((role) => (
          <div key={role.id}>
            <RoleCard
              roleName={role.name}
              onClick={() => {
                onSelectRole(role.name);
              }}
              callable={callable}
              model={model} //_focus={{ outline: "none", boxShadow: "none" }}
              //_active={{ outline: "none" }}
            />
          </div>
        ))}
      </SimpleGrid>
    </Box>
  );
});

export default RolesGrid;
