"use client";

import { model } from "@/models/Model";
import { default as dashModel } from "@/models/DashboardModel";
import { observer } from "mobx-react-lite";
import React, { useEffect } from "react";
import {
  Flex,
  Box,
  useColorModeValue,
  Icon,
  IconButton,
  Center,
} from "@chakra-ui/react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import FrequenciesGrid from "@/components/FrequenciesGrid";
import RolesGrid from "../components/RolesGrid";
import RoleSelectionModal from "@/components/RoleSelectionModal";
import "./globals.css";
import SocketHandler from "@/components/SocketHandler";
import CommunicationsHandler from "@/components/CommuncationsHandler";
import { PhoneIcon } from "@chakra-ui/icons";
import { Call } from "@/types";
interface Props {
  model: typeof model;
}
const App = observer(function (props: Props) {
  const { model } = props;

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

  const onMakeCall = (role: string) => {
    //model.onMakeICCall(role, true);
    //Make call to selected role
  };

  const onMakeAcceptCall = (role: string) => {
    //model.onMakeAcceptCall(role, true);
    //Accept call for selected role
  };

  const onTurnOffCall = (call: Call) => {
    model.onTurnOffCall(call);
    //Turn off call for selected role
  };

  const bgColor = useColorModeValue("gray.100", "gray.800");

  return (
    <Flex direction="column" minH="100vh" bg={bgColor}>
      <SocketHandler model={model} />
      <CommunicationsHandler model={model} dashboardModel={dashModel}/>
      <Header model={model} />
      <Flex flex="1" direction={{ base: "column", md: "row" }}>
        <Box w={{ base: "100%", lg: "66%" }} p={2}>
          {model.configuration && (
            <>
              <FrequenciesGrid model={model} />
            </>
          )}
        </Box>
        {!model.isPilot() && model.selectedRoles.length > 0 && (
          <Box mt={4} w={{ base: "100%", lg: "33%" }} p={2}>
            <RolesGrid
              model={model}
              onSelectRole={onMakeCall}
              callable={true}
              acceptCall={true}
            />
            {model.acceptedCalls.length > 0 && (
              <Flex
                mt={4}
                direction={"column"}
                gap={"20px"}
                boxShadow="md"
                border="1px"
                bg={useColorModeValue("gray.200", "gray.800")}
                borderColor="gray.500"
                padding="1rem"
                marginRight="2rem"
              >
                <>
                  {model.acceptedCalls.map((call) => (
                    <Flex
                      w="100%"
                      direction={"row"}
                      key={call.id}
                      border="1px"
                      p={2}
                      borderRadius={10}
                      borderColor={call.isEmergency ? "red.500" : "gray.500"}
                    >
                      <Center>
                        <div>
                          {call.initiator === model.socket.io?.id
                            ? call.receiverRole
                            : call.initiatorRole}
                        </div>
                      </Center>
                      <div style={{ flex: 1 }}></div>
                      <IconButton
                        aria-label="Call"
                        icon={
                          <PhoneIcon color="red" style={{ rotate: "135deg" }} />
                        }
                        color="red.500"
                        onClick={() => {
                          onTurnOffCall(call);
                        }}
                      />
                    </Flex>
                  ))}
                </>
              </Flex>
            )}
          </Box>
        )}
      </Flex>
      <Footer />
      <RoleSelectionModal model={model} isOpen={model.openRoleModal} />
    </Flex>
  );
});

export default App;
