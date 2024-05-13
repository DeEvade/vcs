// src/components/ConfigMenu.tsx
import React, { useState, useEffect } from "react";
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  IconButton,
  useColorMode,
  Text,
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  keyframes,
  usePrefersReducedMotion,
  Switch,
  FormControl,
  FormLabel,
  Progress,
  Flex,
  Center,
} from "@chakra-ui/react";
import { SettingsIcon } from "@chakra-ui/icons";
import { MdGraphicEq } from "react-icons/md";
import { usePTT } from "../contexts/PTTContext";
import { model as baseModel } from "@/models/Model";
import { observer } from "mobx-react-lite";

interface Props {
  model: typeof baseModel;
}

const ConfigMenu: React.FC<Props> = observer(function (props) {
  const [listeningForKey, setListeningForKey] = useState(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const { pttKey, setPttKey } = usePTT();
  const { colorMode, toggleColorMode } = useColorMode();
  const [buttonText, setButtonText] = useState("Check Mic.");
  const [buttonColor, setButtonColor] = useState("blue");

  const { model } = props;

  // Pulsate animation keyframes for the psuh to talk selection button
  const pulsate = keyframes`
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
   `;

  const onMicValueChanged = (val: any) => {
    model.micGain = val;
  };

  const onRadioValueChanged = (val: any) => {
    model.radioGain = val;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (listeningForKey) {
        setPttKey(event.code);
        setListeningForKey(false);
        event.preventDefault(); // Prevent default action for key press
      }
    };

    if (listeningForKey) {
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [listeningForKey]);

  // Calculate the gain percentage for radio volume and mic gain.
  // Converts slider values to percentage
  const displayGain = Math.round((model.radioGain / 100) * 200);
  const displayMicGain = Math.round((model.micGain / 100) * 200);

  const animation = prefersReducedMotion
    ? undefined
    : `${pulsate} infinite 1.5s ease`;

  const handleEasyMode = () => {
    model.setEasyMode(!model.easyMode);
  };

  const handleMenuClose = () => {
    if (model.analyserActive == true) {
      handleMicCheck();
    }
    if (listeningForKey == true) {
      setListeningForKey(false);
    }
  };

  const handleMicCheck = () => {
    if (model.analyserActive) {
      model.analyserActive = false;
      setButtonText("Check Mic.");
      setButtonColor("blue");
      model.analyserVolume = 0;
    } else {
      model.analyserActive = true;
      setButtonText("Stop Test");
      setButtonColor("red");
    }
  };

  let micVolumeColor: string;

  if (model.analyserVolume <= 30) {
    micVolumeColor = "yellow";
  } else if (model.analyserVolume > 30 && model.analyserVolume < 70) {
    micVolumeColor = "green";
  } else {
    micVolumeColor = "red";
  }

  return (
    <Menu onClose={handleMenuClose}>
      <MenuButton
        as={IconButton}
        aria-label="Options"
        icon={<SettingsIcon />}
        variant="outline"
        _focus={{ outline: "none", boxShadow: "none" }}
        _active={{ outline: "none" }}
      />
      <MenuList>
        <Box p={4}>
          <Text mb={2}>Radio Gain: {displayGain}%</Text>
          <Slider
            defaultValue={50}
            min={0}
            max={100}
            value={model.radioGain}
            onChange={(val) => onRadioValueChanged(val)}
            step={5}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={5}>
              <Box color="gray.600" as={MdGraphicEq} />
            </SliderThumb>
          </Slider>

          <Text mb={2}>Microphone Gain: {displayMicGain}%</Text>
          <Slider
            defaultValue={50}
            min={0}
            max={100}
            value={model.micGain}
            onChange={(val) => onMicValueChanged(val)}
            step={5}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb boxSize={5}>
              <Box color="gray.600" as={MdGraphicEq} />
            </SliderThumb>
          </Slider>
          <Flex align="center" alignItems="center">
            <Center>
              <Text mb={2} mr={2}>
                Mic. Volume Level
              </Text>
              <Button
                size="xs"
                mb={2}
                width="75px"
                onClick={handleMicCheck}
                colorScheme={buttonColor}
              >
                {buttonText}
              </Button>
            </Center>
          </Flex>
          <Progress
            value={model.analyserVolume}
            colorScheme={micVolumeColor}
            mb={2}
          ></Progress>

          <FormControl display="flex" alignItems="center">
            <FormLabel mb="0">Realistic colors</FormLabel>
            <Switch
              isChecked={colorMode == "light"}
              onChange={toggleColorMode}
            />
          </FormControl>
          <Text mb={2} mt={2}>
            Push to Talk Key: {pttKey}
          </Text>
          <Button
            size="sm"
            onClick={() => setListeningForKey(!listeningForKey)}
            animation={listeningForKey ? animation : "none"}
            _focus={{ outline: "none", boxShadow: "none" }}
            _active={{ outline: "none" }}
          >
            {" "}
            {/* Explicitly turn off animation */}
            {listeningForKey ? "Listening..." : "Select New Key"}
          </Button>
        </Box>
        <MenuItem onClick={handleEasyMode} closeOnSelect={false}>
          Easy Mode: {model.easyMode ? "On" : "Off"}
        </MenuItem>
      </MenuList>
    </Menu>
  );
});

export default ConfigMenu;
