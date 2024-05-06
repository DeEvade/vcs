import DashboardModel, { DashboardFrequency } from "@/models/DashboardModel";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  NumberInput,
  NumberInputField,
  InputGroup,
  InputRightElement,
  FormControl,
  FormLabel,
  Flex,
  Button,
  Icon,
  Center,
  Text,
  useDisclosure,
  FormErrorMessage,
  useColorModeValue,
} from "@chakra-ui/react";
import { MdHeadsetMic } from "react-icons/md";
import { observer } from "mobx-react-lite";
import DashboardDeleteCard from "../DashboardDeleteCard";
import { useState, useEffect } from "react";
import { io as socket } from "socket.io-client";

const DashboardFrequenceCard = observer(
  (props: { model: typeof DashboardModel; frequency: DashboardFrequency }) => {
    const { model, frequency } = props;

    const [userCounts, setUserCounts] = useState<{ [key: number]: number}>({});

    const initialState = {
      frequency: frequency.frequency,
    };
    const [frequencyState, setFrequencyState] = useState(initialState);

    const changeState = (key: any, value: any) => {
      setFrequencyState({ ...frequencyState, [key]: value });
    };

    const [saveState, setSaveState] = useState(false);

    const [preSaveState, setPreSaveState] = useState(initialState);

    const editsaveFrequency = () => {
      model.editFrequency({
        frequencyId: frequency.id,
        frequency: frequencyState.frequency,
        configurationId: model.selectedConfigurationId!,
      });
      //onClose();
    };

    const handleCancel = () => {
      console.log("Freq initial state " + initialState.frequency);
      setFrequencyState(initialState);
    };

    useEffect(() => {
      {
        frequencyState.frequency != initialState.frequency
          ? setSaveState(true)
          : setSaveState(false);
      }
    });

    useEffect(() => {
      if(!model.socket.io){
        return;
      }

      model.socket.io.on("countUsersOnFreq", (countUsersOnFreq: { [key: number]: number}) => {
        console.log("before set");
        setUserCounts(countUsersOnFreq);
      }) 

      return () => {
        if(!model.socket.io) return
        model.socket.io.off("countUsersOnFreq")
      } 
    }, [])

    return (
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                {parseFloat(frequency.frequency).toFixed(3)} MHz
              </Box>
              <Flex dir="row" pr="10px">
                <Center gap="5px" color={useColorModeValue("red", "turquoise")} >
                {userCounts[frequency.id] ? userCounts[frequency.id] : 0}
                  <Icon as={MdHeadsetMic} />
                </Center>
              </Flex>

              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <FormControl
              isRequired
              isInvalid={!frequencyState.frequency.trim()}
            >
              <FormLabel>Frequency</FormLabel>
              <NumberInput value={frequencyState.frequency}>
                <InputGroup>
                  <NumberInputField
                    value={frequencyState.frequency}
                    onChange={(e) => {
                      changeState("frequency", e.target.value);
                    }}
                    placeholder="frequency in MHz"
                  />
                  <InputRightElement width="4.5rem">MHz</InputRightElement>
                </InputGroup>
                <FormErrorMessage>Frequency is required!</FormErrorMessage>
              </NumberInput>
            </FormControl>
            <Flex direction="row" gap="10px" pt="10px">
              {saveState != false &&
              frequencyState.frequency.trim() &&
              parseInt(frequencyState.frequency) > 0 &&
              !/[e+-]/.test(frequencyState.frequency) ? (
                <>
                  <Button colorScheme="green" onClick={editsaveFrequency}>
                    Save
                  </Button>
                </>
              ) : (
                <>
                  <Button isDisabled={true}>Save</Button>
                </>
              )}

              {saveState != false ? (
                <>
                  <Button onClick={handleCancel}>Cancel</Button>
                </>
              ) : (
                <>
                  <Button isDisabled={true}>Cancel</Button>
                </>
              )}

              <DashboardDeleteCard
                model={model}
                element={<Button>Delete</Button>}
                name={frequency.frequency + "MHz"}
                id={frequency.id}
                cardType="Frequency"
              />
              {/*<DashboardDeleteCard
                model={model}
                name={frequency.frequency + "MHz"}
                cardType="Frequency"
              />*/}
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  }
);
export default DashboardFrequenceCard;
