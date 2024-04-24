// src/components/FrequenciesGrid.tsx
"use client";
import React, { useEffect, useState } from "react";
import { SimpleGrid } from "@chakra-ui/react";
import FrequencyCard from "./FrequencyCard";
import { Frequency, FrequencyState, Role } from "../types";
import { observer } from "mobx-react-lite";
import { model as baseModel } from "@/models/Model";
import toast from "react-hot-toast";

// Some hardcoded frequencies
/*const initialFrequencies: Frequency[] = [
  { id: 1, frequency: "118.505", label: "SA TWR W" },
  { id: 2, frequency: "126.655", label: "OS ARR-E" },
  { id: 3, frequency: "131.130", label: "OS P3" },
  { id: 4, frequency: "120.505", label: "OS DIR-E" },
  // Add more as needed
];*/

interface Props {
  model: typeof baseModel;
}

const FrequenciesGrid: React.FC<Props> = observer(function (props) {
  const { model } = props;

  const [selectedRoleObject, setSelectedRoleObject] = useState<Role | null>(
    null
  );

  useEffect(() => {
    console.log("selected role object: ");
    const selectedRoleObject = model.getSelectedRoleObject();
    console.log("selected role object: ", selectedRoleObject);

    setSelectedRoleObject(selectedRoleObject);
  }, [model.selectedRole]);


  // Handles all updated receiver lists
  useEffect(() => {
    console.log("RX changed")
    //console.log("frequence" + JSON.stringify(frequencyState));
      model.handleFrequencyJoined();
    toast.success(JSON.stringify(model.RXFrequencies));
  }, [model.RXFrequencies])

  
  if (selectedRoleObject === null) {
    //TODO fix this
    return <>Awaiting role select</>;
  }

  const unorderedFrequencies: Frequency[] = selectedRoleObject.frequencies;
  const frequencies: Frequency[] = unorderedFrequencies
    .slice()
    .sort((a, b) => a.order - b.order);

  const handleToggle = (id: number, type: "RX" | "TX" | "XC") => {
    switch (type) {
      case "RX":
        if (model.RXFrequencies.includes(id)) {
          //Remove from RX array
          model.RXFrequencies = model.RXFrequencies.filter(
            (value) => value !== id
          );
        } else {
          //Add to RX array
          model.RXFrequencies = model.RXFrequencies.concat([id])
        }
        break;
      case "TX":
        if (model.TXFrequencies.includes(id)) {
          //Remove from TX array
          model.TXFrequencies = model.TXFrequencies.filter(
            (value) => value !== id
          );
        } else {
          //Add to TX array
          model.TXFrequencies = model.TXFrequencies.concat([id])

        }
        break;

      case "XC":
        if (model.XCFrequencies.includes(id)) {
          //Remove from XC array
          model.XCFrequencies = model.XCFrequencies.filter(
            (value) => value !== id
          );
        } else {
          //Add to XC array
          model.XCFrequencies = model.XCFrequencies.concat([id])

         }
        break;

      default:
        break;
    }
  };

  return (
    <SimpleGrid
      columns={{ base: 1, md: 2, lg: 3 }}
      spacing="20px"
      minChildWidth="16rem"
      margin="1rem"
    >
      {frequencies.map((frequency) => (
        <FrequencyCard
          key={frequency.id}
          frequency={frequency}
          onToggle={handleToggle}
          model={model}
        />
      ))}
    </SimpleGrid>
  );
});

export default FrequenciesGrid;
