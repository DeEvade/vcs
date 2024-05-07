"use client";

import { model } from "@/models/Model";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import { Flex, Box, useColorModeValue } from "@chakra-ui/react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FrequenciesGrid from "@/components/FrequenciesGrid";
import RolesGrid from "../components/RolesGrid";
import RoleSelectionModal from "@/components/RoleSelectionModal";
import "./globals.css";
import SocketHandler from "@/components/SocketHandler";
import CommunicationsHandler from "@/components/CommuncationsHandler";
interface Props {
  model: typeof model;
}
const App = observer(function (props: Props) {
  const { model } = props;
  const onMakeCall = (role: string) => {
    //model.onMakeICCall(role, true);
    //Make call to selected role
  };

  const onMakeAcceptCall = (role: string) => {
    //model.onMakeAcceptCall(role, true);
    //Accept call for selected role
  };

  const bgColor = useColorModeValue("gray.100", "gray.800");

  useEffect(() => {
    if (model.configuration || !model.socket.connected) {
      return;
    }
    model.fetchConfiguration();
    model.fetchXC();
  }, [model.socket.io]);

  useEffect(() => {
    if (!model.socket.connected) {
      return;
    }

    model.fetchXC();
  }, [model.socket.io]);

  return (
    <Flex direction="column" minH="100vh" bg={bgColor}>
      <SocketHandler model={model} />
      <CommunicationsHandler model={model} />
      <Header model={model} />
      <Flex flex="1" direction={{ base: "column", md: "row" }}>
        <Box w={{ base: "100%", lg: "66%" }} p={2}>
          {model.configuration && (
            <>
              <FrequenciesGrid model={model} />
            </>
          )}
        </Box>
        <Box w={{ base: "100%", lg: "33%" }} p={2}>
          <RolesGrid
            model={model}
            onSelectRole={onMakeCall}
            toSelectedRole={onMakeAcceptCall}
            callable={true}
            acceptCall={true}
          />
        </Box>
      </Flex>
      <Footer />
      <RoleSelectionModal model={model} isOpen={model.openRoleModal} />
    </Flex>
  );
});

export default App;
