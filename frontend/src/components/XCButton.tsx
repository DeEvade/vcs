import React, { useEffect } from "react";
import { observer } from "mobx-react-lite";
import { model as baseModel } from "@/models/Model";
import { Frequency, XC } from "@/types";
import { useState } from "react";
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
  Stack,
  Flex,
  Checkbox,
  useDisclosure,
} from "@chakra-ui/react";
import { rolesToFrequencies } from "@/utils/tools";
import toast from "react-hot-toast";

//Defines the interface for the props expected by the XC button component
interface Props {
  frequencyId: number;
  onToggle: (id: number, type: "RX" | "TX" | "XC") => void;
  model: typeof baseModel;
  buttonElement: JSX.Element;
}

//Creates a button that when pressed renderes a popover with checkbox for selecting frequencies to be cross coupled 
const XCButton = observer((props: Props) => {
  const { frequencyId, onToggle, model, buttonElement } = props;

  const [checkedFrequencies, setCheckedFrequencies] = useState<number[]>([]);

  const getButtonColorScheme = (type: string) => {
    return "blue";
  };
  //Updates checked frequencies when the array XCfrequencies changes
  useEffect(() => {
    const potential = model.XCFrequencies.find((xc: XC) =>
      xc.frequencyIds.includes(frequencyId)
    );
    console.log("potential: ", potential);

    if (!potential) {
      setCheckedFrequencies([]);
      return;
    }
    setCheckedFrequencies(potential.frequencyIds);
  }, [model.XCFrequencies]);

  const freqs = rolesToFrequencies(model.getSelectedRolesObject());

  const otherFrequencies = freqs.filter(
    (frequency: Frequency) => frequency.id !== frequencyId
  );
  /*
  connectFrequencies(frequencyId: number, checkedFrequencies: number[]) {
    const frequency = this.frequencies.find(f => f.id === frequencyId);
    if (frequency) {
      frequency.connectedFrequencies = checkedFrequencies;
    }
  },
  */
  const { onOpen, onClose, isOpen } = useDisclosure();

  //Handles submit of popover
  const handleSubmit = () => {
    const potential = model.XCFrequencies.find((xc: XC) =>
      xc.frequencyIds.includes(frequencyId)
    );
    if (!potential) {
      model.createXC(frequencyId, checkedFrequencies);
    } else {
      if (!potential) return toast.error("XC not found");
      model.updateXC(frequencyId, checkedFrequencies, potential.id);
    }
    onClose();
  };

    /*
    <Flex direction={"column"} gap={4}>
    {otherFrequencies.map((frequency: Frequency) => (
      <Checkbox value={frequency.id}>{frequency.frequency}</Checkbox>
    ))}
  </Flex>
  */

  //Creates a popover with checkboxs that enables choosing of frequencies to be cross coupled 
  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
      <PopoverTrigger>{buttonElement}</PopoverTrigger>
      <Portal>
        <PopoverContent>
          <PopoverArrow />
          <PopoverHeader>XC group</PopoverHeader>
          <PopoverCloseButton />
          <PopoverBody>
            <Flex direction={"column"} gap={4}>
              {otherFrequencies.map((frequency: Frequency) => (
                <Checkbox
                  key={frequency.id}
                  isChecked={checkedFrequencies.includes(frequency.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setCheckedFrequencies([
                        ...checkedFrequencies,
                        frequency.id,
                      ]);
                    } else {
                      setCheckedFrequencies(
                        checkedFrequencies.filter((id) => id !== frequency.id)
                      );
                    }
                  }}
                >
                  {frequency.frequency}
                </Checkbox>
              ))}
            </Flex>
          </PopoverBody>
          <PopoverFooter>
            <Button colorScheme="blue" onClick={handleSubmit}>
              Save
            </Button>
          </PopoverFooter>
        </PopoverContent>
      </Portal>
    </Popover>
  );
});

export default XCButton;
