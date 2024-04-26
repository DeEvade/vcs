import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";
import DashboardModel from "@/models/DashboardModel";
import {
  Flex,
  Select,
  Box,
  Center,
  Accordion,
  Button,
  ButtonGroup,
  Spacer,
} from "@chakra-ui/react";
import { CheckIcon } from "@chakra-ui/icons";
import { observer } from "mobx-react-lite";
import { useEffect } from "react";
import toast from "react-hot-toast";
import DashboardFrequencyCard from "./frequency/DashboardFrequencyCard";
import DashboardRoleCard from "./role/DashboardRoleCard";
import DashboardAddRole from "./role/DashboardAddRole";
import DashboardAddConfig from "./config/DashboardAddConfig";
import DashboardAddFrequency from "./frequency/DashboardAddFrequency";
import DashboardSetActive from "./DashboardSetActive";
import DashboardEditConfig from "./config/DashboardEditConfig";
import DashboardDeleteCard from "./DashboardDeleteCard";
import Footer from "../Footer";

const DashboardApp = observer((props: { model: typeof DashboardModel }) => {
  const { model } = props;

  useEffect(() => {
    if (!model.socket.connected || model.configs) return;
    model.fetchConfigs();
  }, [model.socket.connected, model.configs]);

  if (!model.configs) {
    return <div>Loading...</div>;
  }

  return (
    <Flex
      direction="column"
      maxHeight={"100vh"}
      minH={"100vh"}
      overflowY={"hidden"}
    >
      <Flex direction="column" align="center" padding="20px" gap="20px">
        {/* Header */}
        <Flex direction="row" gap="10px" alignItems="center">
          {model.selectedConfigurationId && (
            <DashboardSetActive model={model} />
          )}
          <Select
            placeholder="Select Configuration"
            value={model.selectedConfigurationId ?? undefined}
            onChange={(e) => {
              e.preventDefault();
              if (!e.target.value) {
                return (model.selectedConfigurationId = null);
              }
              model.selectedConfigurationId = Number.parseInt(e.target.value);
            }}
          >
            {model.configs
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((config) => (
                <option key={config.id} value={config.id}>
                  {config.name}
                  {config.id === model.selectedConfigurationId && <CheckIcon />}
                </option>
              ))}
          </Select>
          <DashboardAddConfig model={model} />
          {model.selectedConfigurationId && (
            <>
              <DashboardEditConfig model={model} />
              <DashboardDeleteCard
                model={model}
                element={<DeleteIcon />}
                name={
                  model.configs.find(
                    (c) => c.id === model.selectedConfigurationId
                  )?.name ?? ""
                }
                id={model.selectedConfigurationId}
                cardType="config"
              />
            </>
          )}
        </Flex>

        {model.selectedConfigurationId && (
          <Flex
            width="100%"
            direction="row"
            gap="10px"
            textAlign={"center"}
            flex={1}
          >
            <Box
              w={{ base: "100%", lg: "66%" }}
              p={2}
              borderRadius="lg"
              border="1px"
              borderColor="gray.500"
              flex={1}
              maxHeight={"78vh"}
              overflowY={"auto"}
            >
              {/* Roles Table */}

              <Flex direction="row" paddingBottom="10px">
                <Flex flex={1}></Flex>
                <h2>Roles</h2>
                <Flex flex={1}></Flex>
                <Center marginRight={"5px"}>
                  <DashboardAddRole model={model} />
                </Center>
              </Flex>
              <Flex direction={"column"} gap={"20px"}>
                {model.roles
                  .filter(
                    (r) => r.configurationId === model.selectedConfigurationId
                  )
                  .map((role) => (
                    <DashboardRoleCard
                      key={role.id}
                      model={model}
                      role={role}
                    />
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
              maxHeight={"78vh"}
              overflowY={"auto"}
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
                  {model.frequencies
                    .filter(
                      (r) => r.configurationId === model.selectedConfigurationId
                    )
                    .map((frequency) => (
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
        )}
      </Flex>
      <Spacer />
      <Footer />
    </Flex>
  );
});

export default DashboardApp;
