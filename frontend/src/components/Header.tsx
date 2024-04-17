// src/components/Header.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Flex, Text, Box, useColorMode, Button } from "@chakra-ui/react";
import ConfigMenu from "./ConfigMenu"; // Ensure the path is correct
import { model as baseModel } from "@/models/Model";
import { observer } from "mobx-react-lite";

const UtcClock = () => {
  const [currentTime, setCurrentTime] = useState(() => new Date());
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Indicate the component has mounted
    const timerId = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timerId);
  }, []);

  if (!isClient) {
    return null; // or a placeholder/loading state
  }

  const hours = currentTime.getUTCHours().toString().padStart(2, "0");
  const minutes = currentTime.getUTCMinutes().toString().padStart(2, "0");
  const seconds = currentTime.getUTCSeconds().toString().padStart(2, "0");

  return (
    <Flex align="center">
      <Box textAlign="right">
        <Text fontSize="lg" fontWeight="bold">{`${hours}:${minutes}`}</Text>
        <Text fontSize="sm" color="gray.500" alignSelf="flex-end">
          {seconds}
        </Text>
      </Box>
      <Box
        width="2px"
        bg="gray.400"
        alignSelf="stretch"
        marginLeft="1rem"
      ></Box>{" "}
    </Flex>
  );
};

interface Props {
  model: typeof baseModel;
}

const Header = observer(function (props: Props) {
  const { model } = props;
  const selectedRole = model.selectedRole;
  const { colorMode } = useColorMode();
  const bgColor = colorMode === "light" ? "gray.100" : "gray.800";

  const resetSelectedRole = () => {
    model.setSelectedRole("");
    model.setOpenRoleModal(true);
  };
  const connected = model.socket.connected;
  return (
    <Box bg={bgColor} px={4}>
      <Flex h={16} alignItems="center" justifyContent="space-between">
        <Flex>
          <UtcClock /> {/* UtcClock with separator */}
          <Text
            marginLeft={4}
            fontSize="lg"
            fontWeight="bold"
            maxWidth={100}
            flex={0}
            color={connected ? "green.500" : "red.500"}
          >
            {connected ? "Online" : "Offline"}
          </Text>
        </Flex>

        <Button onClick={resetSelectedRole}>{selectedRole}</Button>
        <ConfigMenu model={model} />
      </Flex>
    </Box>
  );
});

export default Header;
