import DashboardModel from "@/models/DashboardModel";
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
} from "@chakra-ui/react";
import { MdHeadsetMic } from "react-icons/md";
import { observer } from "mobx-react-lite";
import DashboardDeleteCard from "../DashboardDeleteCard";
import { useState } from "react";

const DashboardFrequenceCard = observer(
  (props: { model: typeof DashboardModel; frequency: any }) => {
    const { model, frequency } = props;

    const initialState = {
      frequency: frequency.frequency,
    };
    const [frequencyState, setFrequencyState] = useState(initialState);

    const changeState = (key: any, value: any) => {
      setFrequencyState({ ...frequencyState, [key]: value });
    };
    return (
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                {frequency.frequency} MHz
              </Box>
              <Flex dir="row" pr="10px">
                <Center gap="5px" color="turquoise">
                  0
                  <Icon as={MdHeadsetMic} />
                </Center>
              </Flex>

              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <FormControl>
              <FormLabel>Frequency</FormLabel>
              <NumberInput>
                <InputGroup>
                  <NumberInputField
                    value={frequencyState.frequency}
                    onChange={(e) => {
                      changeState("", e.target.value);
                    }}
                  />
                  <InputRightElement width="4.5rem">MHz</InputRightElement>
                </InputGroup>
              </NumberInput>
            </FormControl>
            <Flex direction="row" gap="10px" pt="10px">
              <Button
                colorScheme="green"
                onClick={() => {
                  //TODO“
                }}
              >
                Save
              </Button>
              {/*<DashboardDeleteCard
                model={model}
                name={frequency.frequency}
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
