import React, { useEffect, useState } from "react";
import { observer } from "mobx-react-lite";
import { Box, Checkbox, Popover, PopoverContent, PopoverTrigger, useDisclosure, Button } from "@chakra-ui/react";
import DashboardModel, {DashboardFrequency,DashboardRoleFrequency, DashboardRole} from "@/models/DashboardModel";
import { rolesToFrequencies } from "@/utils/tools";
import { Frequency, XC } from "@/types";

interface Props {
  frequencyId: number;
  buttonElement: JSX.Element;
  model: typeof DashboardModel;
  role: DashboardRole;
}

const DashboardXCButton = observer((props: Props) => {
  const { frequencyId,buttonElement, model, role } = props;
  const [frequencies, setFrequencies] = useState<DashboardFrequency[]>([]);
  const [checkedFrequencies, setCheckedFrequencies] = useState<number[]>([]);
  

  useEffect(() => {
    model.fetchConfigs();
  }, [model]);

  useEffect(() => {
    if(model.roleFrequencies.length > 0 && props.role && props.role.id !== undefined){
      setFrequencies(model.roleFrequencies.filter(rf => rf.role && rf.role.id === props.role.id).map(rf => rf.frequency));
    }
  }, [model.roleFrequencies, props.role]);

  useEffect(() => {
    const potential = model.XCFrequencies.find((xc: XC) =>
      xc.frequencyIds.includes(frequencyId)
    );
    if (!potential) {
      setCheckedFrequencies([]);
      return;
    }
    setCheckedFrequencies(potential.frequencyIds);
  }, [model.XCFrequencies]);

  const { onOpen, onClose, isOpen } = useDisclosure();

  const handleSubmit = () => {
    const potential = model.XCFrequencies.find((xc: XC) =>
      xc.frequencyIds.includes(role.id)
    );
    if (!potential) {
      model.createXC(role.id, checkedFrequencies);
    } else {
      if (!potential) return;
      model.updateXC(role.id, checkedFrequencies, potential.id);
    }
    model.fetchConfigs();
    onClose();
  };


  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
      <PopoverTrigger>{buttonElement}</PopoverTrigger>
      <PopoverContent>
        <Box padding={4}> 
          {frequencies.map((frequency, index) => (
            <Box key={index}>
              <Checkbox 
                isChecked={checkedFrequencies.includes(frequency.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setCheckedFrequencies([...checkedFrequencies, frequency.id]);
                  } else {
                    setCheckedFrequencies(checkedFrequencies.filter(id => id !== frequency.id));
                  }
                }}
              >
                {frequency.frequency} MHz - {frequency.id}
              </Checkbox>
            </Box>
          ))}
          <Button colorScheme="blue" mt={4} onClick={() => handleSubmit()}>Save</Button> 
        </Box>
      </PopoverContent>
    </Popover>
  );
});

export default DashboardXCButton;