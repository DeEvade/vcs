// src/compontens/FrequencyCard.tsx
"use client";
import React from "react";
import {
  Box,
  Button,
  Text,
  Grid,
  GridItem,
  useColorMode,
  PopoverTrigger,
  Portal,
  PopoverContent,
  PopoverArrow,
  PopoverHeader,
  PopoverCloseButton,
  PopoverBody,
  PopoverFooter,
  Popover,
} from "@chakra-ui/react";
import { usePTT } from "../contexts/PTTContext";
import { observer } from "mobx-react-lite";
import { model as baseModel } from "@/models/Model";
import { Frequency } from "@/types";
import XCButton from "./XCButton";

interface Props {
  frequency: Frequency;
  onToggle: (id: number, type: "RX" | "TX" | "XC") => void;
  model: typeof baseModel;
}

const FrequencyCard: React.FC<Props> = observer(function ({
  frequency,
  onToggle,
  model,
}) {
  const { colorMode } = useColorMode();
  const bgColor = colorMode === "light" ? "gray.200" : "gray.800";
  const { pttActive } = usePTT();
  const easyMode = model.easyMode;

  const frequencyState = model.getFrequencyState(frequency.id);

  //kolla varje rolls första order och visa den

  const getFrequencyLabel = (id: number): string => {
    let name = "empty";
    model.configuration?.roles.forEach((role) => {
      role.frequencies.forEach((frequency) => {
        if (frequency.id === id && frequency.order === 1) {
          console.log("role name: ", role.name);
          return (name = role.name);
        }
      });
    });
    return name;
  };

  const frequencyLabel = getFrequencyLabel(frequency.id);

  const handleToggle = (type: "RX" | "TX" | "XC") => {
    if (type === "RX") {
      // If RX is active and TX is also active, deactivate both.
      if (frequencyState.RX && frequencyState.TX) {
        onToggle(frequency.id, "RX"); // Deactivate RX
        onToggle(frequency.id, "TX"); // Deactivate TX
      } else if (frequencyState.RX) {
        // If only RX is active (and TX is not), just deactivate RX.
        onToggle(frequency.id, "RX");
      } else {
        // If RX is not active, activate it.
        onToggle(frequency.id, "RX");
      }
    } else if (type === "TX") {
      // Activating TX should always activate RX if it's not already active.
      if (!frequencyState.RX) {
        onToggle(frequency.id, "RX");
      }
      onToggle(frequency.id, "TX");
    } else if (type === "XC") {
      onToggle(frequency.id, "XC");
    }
  };

  // Determine button color based on PTTActive state and button state
  const getButtonColorScheme = (buttonType: "RX" | "TX" | "XC") => {
    const buttonActive = frequencyState[buttonType];
    const isPTTActive = pttActive && buttonActive;
    if (buttonType == "XC") {
      return buttonActive ? "green" : "gray";
    } else if (
      buttonType == "RX" &&
      frequencyState["TX"] == false &&
      pttActive
    ) {
      return buttonActive ? "green" : "gray";
    }
    return isPTTActive ? "yellow" : buttonActive ? "green" : "gray";
  };

  return (
    <Box
      p={4}
      borderRadius="lg"
      border="1px"
      borderColor="gray.500"
      bg={bgColor}
    >
      <Grid
        templateRows="repeat(2, 1fr)"
        templateColumns="repeat(2, 1fr)"
        gap={1}
      >
        <GridItem colSpan={1}>
          <Text fontSize="xl">
            {frequency.frequency +
              (easyMode && frequency.order === 1 ? "(u)" : "")}
          </Text>
          <Text
            fontSize="sm"
            minHeight="20px"
            style={{ visibility: easyMode ? "visible" : "hidden" }}
          >
            {frequencyLabel ? frequencyLabel : ""}
          </Text>
        </GridItem>

        <GridItem colSpan={1}>
          <Button
            colorScheme={getButtonColorScheme("RX")}
            _focus={{ outline: "none", boxShadow: "none" }}
            _active={{ outline: "none" }}
            onClick={() => handleToggle("RX")}
            width="100%"
            height="100%"
          >
            RX
          </Button>
        </GridItem>

        <GridItem colSpan={1} width="50%">
          <XCButton
            key={frequency.id}
            frequencyId={frequency.id}
            onToggle={onToggle}
            model={model}
            buttonElement={
              <Button
                colorScheme={getButtonColorScheme("XC")}
                _focus={{ outline: "none", boxShadow: "none" }}
                _active={{ outline: "none" }}
                width="100%"
                height="100%"
              >
                XC
              </Button>
            }
          />
        </GridItem>

        <GridItem colSpan={1}>
          <Button
            colorScheme={getButtonColorScheme("TX")}
            _focus={{ outline: "none", boxShadow: "none" }}
            _active={{ outline: "none" }}
            onClick={() => handleToggle("TX")}
            width="100%"
            height="100%"
          >
            TX
          </Button>
        </GridItem>
      </Grid>
    </Box>
  );
});

export default FrequencyCard;
