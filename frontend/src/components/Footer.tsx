// src/components/Footer.jsx
"use client";
import React, { useState } from "react";
import {
  Box,
  Button,
  Flex,
  Input,
  Text,
  useColorModeValue,
  useDisclosure,
} from "@chakra-ui/react";
import {
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react";

//Footer for Voice communication System 2024 title and tutorial page 
const Footer = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const btnRef = React.useRef();

  const bgColor = useColorModeValue("gray.200", "gray.700");
  const bgColorTitle = useColorModeValue("black", "white");

  return (
    //This component renderes a footer containing the system title and a button to open a tutorial drawer
    <Box p={4} mt={4}>
      <Flex alignItems="center" justifyContent="center">
        <Text textAlign="center">Voice Communication System 2024</Text>
        <Button ml={10} color={bgColorTitle} bgColor={bgColor} onClick={onOpen}>
          Tutorial
        </Button>
      </Flex>
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="lg">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader style={{ color: bgColorTitle }} fontSize="xl">
            Tutorial
          </DrawerHeader>

          <DrawerBody>
            <Text>
              <Text as="h2" fontSize="lg" mt={4} fontWeight="bold">
                Connecting:
              </Text>
              <Text>
                When you enter the main menu, you choose between the roles of
                ATCO or pilot. If you choose ATCO, you will have a selection of
                different roles, which you can also change in the dashboard.
                After selecting your role, you can connect to a frequency by
                pressing either RX (receive only) or TX (transmit and receive).
                You can also choose to take on multiple ATCO roles by pressing
                the + button next to your current ATCO role.
              </Text>

              <Text as="h2" fontSize="lg" mt={4} fontWeight="bold">
                Cross Coupling:
              </Text>
              <Text>
                As an ATCO, you have the option to cross-couple two or more
                frequencies, allowing users connected to those frequencies to
                hear and transmit to each other.
              </Text>

              <Text as="h2" fontSize="lg" mt={4} fontWeight="bold">
                Internal Communication:
              </Text>
              <Text>
                While in an ATCO role, you can choose to make either a normal or
                emergency call to another user in an ATCO role. When making a
                normal call, the other user must accept the call to transmit. In
                an emergency call, you will automatically begin transmitting if
                another user is connected to that role.
              </Text>

              <Text as="h2" fontSize="lg" mt={4} fontWeight="bold">
                Dashboard:
              </Text>
              <Text>
                You can access the dashboard by typing "/dashboard" at the end
                of the URL. From there, you can add or delete frequencies, add
                or delete ATCO roles, and see the number of active users on each
                frequency.
              </Text>
            </Text>
          </DrawerBody>

          <DrawerFooter></DrawerFooter>
        </DrawerContent>
      </Drawer>
    </Box>
  );
};

export default Footer;
