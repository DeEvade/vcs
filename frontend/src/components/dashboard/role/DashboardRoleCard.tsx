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
  Menu,
  MenuItem,
  MenuList,
  MenuItemOption,
  MenuButton,
  MenuOptionGroup,
  Icon,
  Center,
  IconButton,
  SimpleGrid,
  FormErrorMessage,
  Switch,
  NumberInput,
  NumberInputField,
  useColorModeValue,
  InputGroup,
  InputRightElement,
} from "@chakra-ui/react";
import { MdAddCircleOutline, MdClear } from "react-icons/md";
import { observer } from "mobx-react-lite";
import { useState, useEffect } from "react";
import DashboardDeleteCard from "../DashboardDeleteCard";
import DashboardRoleFrequencyCard from "./DashboardRoleFrequencyCard";
import XCButton from "@/components/XCButton";

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
        f["isPrimary"] = RF.isPrimary;
        return f;
      });
    };

    const initialState = {
      name: role.name,
      id: role.id,
      type: role.type,

      frequencies: getFrequenciesForRole(role, model),
    };

    const [preSaveState, setPreSaveState] = useState(initialState);

    useEffect(() => {
      setRoleState(initialState);
      console.log("role changed");
    }, [model.roleFrequencies]);

    useEffect(() => {
      {
        roleState.name != initialState.name ||
        roleState.type != initialState.type ||
        JSON.stringify(roleState.frequencies) !==
          JSON.stringify(preSaveState.frequencies)
          ? setSaveState(true)
          : setSaveState(false);
      }
    });

    useEffect(() => {
      console.log(model.delayTime);
    }, [model.delayTime]);

    const [roleState, setRoleState] = useState(initialState);

    const [saveState, setSaveState] = useState(false);

    const [delayState, setDelayState] = useState(false);

    const changeState = (key: any, value: any) => {
      setRoleState({ ...roleState, [key]: value });
    };

    const handleDelaySwitch = () => {
      {
        delayState == true ? setDelayState(false) : setDelayState(true);
      }
    };

    const handleEdit = () => {
      model.editRole({
        roleId: roleState.id,
        name: roleState.name,
        type: roleState.type,
      });
    };

    const handleCancel = () => {
      setRoleState(initialState);
    };

    const frequencies = model.frequencies.filter(
      (f) => f.configurationId === model.selectedConfigurationId
    );

    const onDeleteRoleFrequency = (roleId: number, frequencyId: number) => {
      model.onDeleteRoleFrequency(roleId, frequencyId);
      console.log(saveState);
    };

    const onAddPrimaryFrequency = (frequencyId: number, roleId: number) => {
      model.onAddPrimaryFrequency(roleId, frequencyId);
    };

    const onAddSecondaryFrequency = (frequencyId: number, roleId: number) => {
      model.onAddSecondaryFrequency(roleId, frequencyId);
    };

    const onDelayValueChanged = (val: any) => {
      model.delayTime = val;
      console.log("onDelayValueChanged is " + val);
    };

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
              {roleState.type == "pilot" && (
                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">Satellite Delay?</FormLabel>
                  <Switch
                    pr="20px"
                    onChange={handleDelaySwitch}
                    isChecked={delayState}
                  />
                  {delayState == true && (
                    <NumberInput>
                      <InputGroup>
                        <NumberInputField
                          placeholder="Milliseconds"
                          value={model.delayTime}
                          onChange={(e) => {
                            onDelayValueChanged(parseInt(e.target.value));
                            // model.delayTime = parseInt(e.target.value);
                          }}
                        />
                        <InputRightElement width="3.5rem">ms</InputRightElement>
                      </InputGroup>
                    </NumberInput>
                  )}
                </FormControl>
              )}
              <FormControl
                pb="10px"
                isRequired
                isInvalid={!roleState.name.trim()}
              >
                <FormLabel>Role name</FormLabel>
                <Input
                  value={roleState.name}
                  onChange={(e) => {
                    changeState("name", e.target.value);
                  }}
                  placeholder="Enter role name"
                />
                <FormErrorMessage>Role name is required!</FormErrorMessage>
              </FormControl>

              {roleState.type != "pilot" && (
                <>
                  <Box
                    bg={useColorModeValue("gray.200", "gray.750")}
                    borderRadius="lg"
                    height="40px"
                    alignContent="center"
                    fontWeight="bold"
                  >
                    Assign primary frequency
                  </Box>
                  <Box>
                    <SimpleGrid columns={2} spacing={5}>
                      {roleState.frequencies
                        .filter((f) => f.isPrimary)
                        .map((frequency) => (
                          <DashboardRoleFrequencyCard
                            key={`${frequency.frequency}:${roleState.name}`}
                            model={model}
                            name={frequency.frequency}
                            onDelete={() => {
                              onDeleteRoleFrequency(roleState.id, frequency.id);
                            }}
                          />
                        ))}
                    </SimpleGrid>
                  </Box>
                  <Menu>
                    <Center>
                      <MenuButton
                        as={IconButton}
                        icon={<MdAddCircleOutline size={25} />}
                        backgroundColor="transparent"
                      />
                    </Center>

                    <MenuList>
                      {frequencies
                        .filter(
                          (f) =>
                            !roleState.frequencies.find((f2) => f2.id === f.id)
                        )
                        .map((frequency) => (
                          <MenuItemOption
                            key={frequency.id}
                            value={frequency.id.toString()}
                            onClick={() => {
                              onAddPrimaryFrequency(frequency.id, roleState.id);
                            }}
                          >
                            {parseFloat(frequency.frequency).toFixed(3)} MHz
                          </MenuItemOption>
                        ))}
                    </MenuList>
                  </Menu>
                </>
              )}

              <Box
                bg={useColorModeValue("gray.200", "gray.750")}
                borderRadius="lg"
                height="40px"
                alignContent="center"
                fontWeight="bold"
              >
                Assign secondary frequency
              </Box>
              <Box>
                <SimpleGrid columns={2} spacing={5}>
                  {roleState.frequencies
                    .filter((f) => !f.isPrimary)
                    .map((frequency) => (
                      <DashboardRoleFrequencyCard
                        key={frequency.id}
                        model={model}
                        name={frequency.frequency}
                        onDelete={() => {
                          onDeleteRoleFrequency(roleState.id, frequency.id);
                        }}
                      />
                    ))}
                </SimpleGrid>
              </Box>

              <Menu>
                <Center>
                  <MenuButton
                    as={IconButton}
                    icon={<MdAddCircleOutline size={25} />}
                    backgroundColor="transparent"
                  />
                </Center>

                <MenuList>
                  {frequencies
                    .filter(
                      (f) => !roleState.frequencies.find((f2) => f2.id === f.id)
                    )
                    .map((frequency) => (
                      <MenuItemOption
                        key={frequency.id}
                        value={frequency.id.toString()}
                        onClick={() => {
                          onAddSecondaryFrequency(frequency.id, roleState.id);
                        }}
                      >
                        {parseFloat(frequency.frequency).toFixed(3)} MHz
                      </MenuItemOption>
                    ))}
                </MenuList>
              </Menu>

              <Flex direction="row" gap="10px">
                {saveState != false && roleState.name.trim() ? (
                  <>
                    <Button colorScheme="green" onClick={handleEdit}>
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
                  <Button isDisabled={true}>Cancel</Button>
                )}

                <DashboardDeleteCard
                  model={model}
                  element={<Button>Delete</Button>}
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
