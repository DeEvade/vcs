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
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import DashboardDeleteCard from "../DashboardDeleteCard";

const DashboardFrequenceCard = observer(
  (props: { model: typeof DashboardModel; frequency: any }) => {
    const { model, frequency } = props;
    return (
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                {frequency.frequency} MHz
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <FormControl>
              <FormLabel>Frequency</FormLabel>
              <NumberInput value={frequency.frequency}>
                <InputGroup>
                  <NumberInputField />
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
              <DashboardDeleteCard
                model={model}
                name={frequency.frequency}
                cardType="Frequency"
              />
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  }
);
export default DashboardFrequenceCard;
