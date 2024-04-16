"use client";

import { model } from "@/models/Model";
import { observer } from "mobx-react-lite";

import React, { useEffect } from "react";
import { Flex, Box } from "@chakra-ui/react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FrequenciesGrid from "@/components/FrequenciesGrid";
import RolesGrid from "../components/RolesGrid";
import RoleSelectionModal from "@/components/RoleSelectionModal";
import "./globals.css";
interface Props {
  model: typeof model;
}
const App = observer(function (props: Props) {
  const { model } = props;
  const onSelectRole = (role: string) => {
    model.setSelectedRole(role);
  };

  return (
    <Flex direction="column" minH="100vh">
      <Header model={model} />
      <Flex flex="1" direction={{ base: "column", md: "row" }}>
        <Box w={{ base: "100%", lg: "66%" }} p={2}>
          <FrequenciesGrid model={model} />
        </Box>
        <Box w={{ base: "100%", lg: "33%" }} p={2}>
          <RolesGrid onSelectRole={onSelectRole} />
        </Box>
      </Flex>
      <Footer />
      <RoleSelectionModal model={model} isOpen={model.openRoleModal} />
    </Flex>
  );
});

export default App;
