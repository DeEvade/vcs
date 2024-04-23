/* eslint-disable 
import DashboardModel from "@/models/DashboardModel";
import { Box } from "@chakra-ui/react";
import { observer } from "mobx-react-lite";

const DashboardRoleCard = () => {
  return <Box></Box>;
};

export default DashboardRoleCard;
*/

import DashboardModel, { DashboardRole } from "@/models/DashboardModel";

import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Flex,
  FormControl,
  FormLabel,
  Input,
  Radio,
  RadioGroup,
  Select,
  Stack,
  Tag,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useState } from "react";
import DashboardDeleteCard from "../DashboardDeleteCard";

const DashboardFrequenceCard = observer(
  (props: { model: typeof DashboardModel; role: DashboardRole }) => {
    const { model, role } = props;

    const getFrequenciesForRole = (
      role: DashboardRole,
      model: typeof DashboardModel
    ) => {
      const RFs = model.roleFrequencies.filter((RF) => RF.role.id === role.id);
      return RFs.map((RF) => {
        const f = RF.frequency;
        f["order"] = RF.order;
        return f;
      });
    };

    const initialState = {
      name: role.name,
      id: role.id,
      type: role.type,

      frequencies: getFrequenciesForRole(role, model),
    };
    const [roleState, setRoleState] = useState(initialState);

    const changeState = (key: any, value: any) => {
      setRoleState({ ...roleState, [key]: value });
    };

    const [primaryFrequency, setPrimaryFrequency] = useState(
      initialState.frequencies.find((f) => f.order === 1)
    );
    return (
      <Accordion allowToggle>
        <AccordionItem>
          <h2>
            <AccordionButton>
              <Box as="span" flex="1" textAlign="left">
                {role.name}
              </Box>
              <Tag colorScheme="teal">{role.type.toUpperCase()}</Tag>
              <Box width="10px"></Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel pb={4}>
            <Flex direction="column" gap="10px">
              <RadioGroup
                onChange={(value) => {
                  changeState("type", value);
                }}
                value={roleState.type}
              >
                <Stack direction="row">
                  <Radio value="ATC">ATC</Radio>
                  <Radio value="pilot">PILOT</Radio>
                </Stack>
              </RadioGroup>
              <FormControl>
                <FormLabel>Role name</FormLabel>
                <Input
                  value={roleState.name}
                  onChange={(e) => {
                    changeState("name", e.target.value);
                  }}
                  placeholder="Enter role name"
                />
              </FormControl>
              <FormLabel>Primary Frequency</FormLabel>
              <Select
                onSelect={(e) => {
                  e.preventDefault();
                }}
                defaultValue={primaryFrequency?.id}
              >
                <option>None</option>
                {roleState.frequencies.map((frequency) => (
                  <option key={frequency.id} value={frequency.id}>
                    {frequency.frequency}
                  </option>
                ))}
              </Select>

              <Flex direction="column" gap="10px">
                {roleState.frequencies
                  .filter((f) => f.order !== 1)
                  .map((frequency) => (
                    <Box key={frequency.id}>{frequency.frequency}</Box>
                  ))}
              </Flex>
              <Flex direction="row" gap="10px">
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
                  type={"role"}
                  name={roleState.name}
                  id={roleState.id}
                  cardType="Role"
                />
              </Flex>
            </Flex>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    );
  }
);
export default DashboardFrequenceCard;
