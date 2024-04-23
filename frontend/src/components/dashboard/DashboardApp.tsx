import { AddIcon, EditIcon } from "@chakra-ui/icons";
import DashboardModel from "@/models/DashboardModel";
import {
  Flex,
  Select,
  Box,
  Center,
  Accordion,
  Button,
  ButtonGroup,
} from "@chakra-ui/react";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import toast from "react-hot-toast";
import DashboardFrequencyCard from "./frequency/DashboardFrequencyCard";
import DashboardRoleCard from "./role/DashboardRoleCard";
import DashboardAddRole from "./role/DashboardAddRole";
import DashboardAddConfig from "./config/DashboardAddConfig";
import DashboardAddFrequency from "./frequency/DashboardAddFrequency";
import DashboardSetActive from "./DashboardSetActive";

const DashboardApp = observer((props: { model: typeof DashboardModel }) => {
  const { model } = props;

  useEffect(() => {
    if (!model.socket.connected) return;
    model.fetchConfigs();
  }, [model.socket.connected]);

  if (!model.configs) {
    return <div>Loading...</div>;
  }

  return (
    <Flex direction="column" align="center" padding="20px" gap="20px">
      <Flex direction="row" gap="10px" alignItems="center">
        <Select defaultChecked={true} defaultValue="option1">
          {model.configs.map((config) => (
            <option key={config.id} value={config.id}>
              {config.name}
            </option>
          ))}
        </Select>
        <DashboardAddConfig model={model} />
        <EditIcon boxSize={5} cursor="pointer" />
      </Flex>

      <Flex width="100%" direction="row" gap="10px" textAlign={"center"}>
        {/* Second Table */}

        <Box
          w={{ base: "100%", lg: "66%" }}
          p={2}
          borderRadius="lg"
          border="1px"
          borderColor="gray.500"
          flex={1}
        >
          <Flex direction="row" paddingBottom="10px">
            <Flex flex={1}></Flex>
            <h2>Roles</h2>
            <Flex flex={1}></Flex>
            <Center marginRight={"5px"}>
              <DashboardAddRole model={model} />
            </Center>
          </Flex>
          <Flex direction={"column"} gap={"20px"}>
            {model.roles.map((role) => (
              <DashboardRoleCard key={role.id} model={model} role={role} />
            ))}
          </Flex>

          {/* Add content for the second table */}
        </Box>

        <Box
          w={{ base: "100%", lg: "66%" }}
          p={2}
          borderRadius="lg"
          border="1px"
          borderColor="gray.500"
          flex={1}
        >
          <Flex direction={"column"}>
            <Flex direction="row" paddingBottom="10px">
              <Flex flex={1}></Flex>
              <h2>Frequencies</h2>
              <Flex flex={1}></Flex>
              <Center marginRight={"5px"}>
                <DashboardAddFrequency model={model} />
              </Center>
            </Flex>
            <Flex direction={"column"} gap={"20px"}>
              {model.frequencies.map((frequency) => (
                <DashboardFrequencyCard
                  key={frequency.id}
                  model={model}
                  frequency={frequency}
                />
              ))}
            </Flex>
          </Flex>
          {/* Add content for the second table */}
        </Box>
      </Flex>
    </Flex>
  );
});

export default DashboardApp;
