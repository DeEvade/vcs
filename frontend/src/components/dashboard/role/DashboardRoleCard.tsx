/* eslint-disable 
import DashboardModel from "@/models/DashboardModel";
import { Box } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";

const DashboardRoleCard = () => {
  return <Box></Box>;
};

export default DashboardRoleCard;
*/

import DashboardModel from "@/models/DashboardModel";
import { Role } from "@/types";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Stack,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";

const DashboardFrequenceCard = observer(
  (props: { model: typeof DashboardModel; role: Role }) => {
    const { model, role } = props;
    return (
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                {role.name}
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <RadioGroup onChange={() => {}} value={"asd"}>
              <Stack direction="row">
                <Radio value="1">ATC</Radio>
                <Radio value="2">PILOT</Radio>
              </Stack>
            </RadioGroup>
            <FormControl>
              <FormLabel>Role name</FormLabel>
              <Input placeholder="Enter role name" />
            </FormControl>
            <Flex direction="row" gap="10px"></Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  }
);
export default DashboardFrequenceCard;
