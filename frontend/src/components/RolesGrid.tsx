// src/components/RolesGrid.tsx
import React from "react";
import { Box, Button, SimpleGrid, useColorModeValue } from "@chakra-ui/react";
import RoleCard from "./RoleCard";
import { Role } from "@/types";
import { observer } from "mobx-react-lite";
import { model as basemModel } from "@/models/Model";
import Callbutton from "./Callbutton";
import AcceptICCallbutton from "./Callbutton";

interface RolesGridProps {
  onSelectRole: (roleName: string) => void; // Adding a new prop for role selection
  toSelectedRole: (roleName: string) => void;
  model: typeof basemModel;
  callable: boolean;
  acceptCall: boolean;
}

// Some hardcoded roles
/*const initialRoles: Role[] = [
  { name: "OS DIR-E", primaryFrequency: "120.505" },
  { name: "OS ARR-E", primaryFrequency: "126.655" },
  { name: "OS APP-C", primaryFrequency: "" },
  { name: "OS P3", primaryFrequency: "131.130" },
  { name: "SA TWR W", primaryFrequency: "118.505" },
  // Add more as needed
];*/

const RolesGrid: React.FC<RolesGridProps> = observer(function ({
  onSelectRole,
  toSelectedRole,
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

  return (
    <Box p={2}>
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
