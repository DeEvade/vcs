// src/components/RolesGrid.tsx
import React from "react";
import { Box, SimpleGrid } from "@chakra-ui/react";
import RoleCard from "./RoleCard";
import { Role } from "@/types";
import { observer } from "mobx-react-lite";
import { model as basemModel } from "@/models/Model";

interface RolesGridProps {
  onSelectRole: (roleName: string) => void; // Adding a new prop for role selection
  model: typeof basemModel;
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
  model,
}) {
  if (model.configuration === null) {
    return <>Awaiting configuration</>;
  }
  const roles: Role[] = model.configuration.roles.filter(
    (role) => role.type === "ATC"
  );

  return (
    <Box p={2}>
      <SimpleGrid
        minChildWidth="4.4rem"
        spacing={4}
        boxShadow="md"
        border="1px"
        borderColor="gray.500"
        padding="1rem"
        marginRight="2rem"
      >
        {roles.map((role) => (
          <RoleCard
            key={role.name}
            roleName={role.name}
            onClick={() => onSelectRole(role.name)}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
});

export default RolesGrid;
