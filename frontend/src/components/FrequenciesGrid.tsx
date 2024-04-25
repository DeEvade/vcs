// src/components/FrequenciesGrid.tsx
"use client";
import React, { useEffect, useState } from "react";
import { SimpleGrid } from "@chakra-ui/react";
import FrequencyCard from "./FrequencyCard";
import { Frequency, FrequencyState, Role } from "../types";
import { observer } from "mobx-react-lite";
import { model as baseModel } from "@/models/Model";
import { rolesToFrequencies } from "@/utils/tools";

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

  const [selectedRolesObject, setSelectedRolesObject] = useState<Role[] | null>(
    null
  );

  useEffect(() => {
    //console.log("selected role object: ");
    const selectedRolesObject = model.getSelectedRolesObject();
    //console.log("selected role object: ", selectedRolesObject);

    setSelectedRolesObject(selectedRolesObject);
    setUnorderedFrequencies(rolesToFrequencies(selectedRolesObject));
  }, [model.selectedRoles]);

  const [unorderedFrequencies, setUnorderedFrequencies] = useState<Frequency[]>(
    []
  );

  useEffect(() => {
    const roleObject = model.getSelectedRolesObject();
    console.log(
      "got herea 123: ",
      rolesToFrequencies(roleObject),
      selectedRolesObject
    );

    setUnorderedFrequencies(rolesToFrequencies(roleObject));
  }, [model.configuration!.roles]);

  if (selectedRolesObject === null || selectedRolesObject.length === 0) {
    //TODO fix this
    return <>Awaiting role select</>;
  }

  //remove duplicates

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
          model.RXFrequencies.push(id);
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
          model.TXFrequencies.push(id);
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
          model.XCFrequencies.push(id);
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
