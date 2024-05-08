// src/contexts/PTTContext.tsx
// A react context for the push to state
"use client";
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { model as baseModel } from "@/models/Model";

interface PTTContextType {
  pttKey: string;
  setPttKey: (key: string) => void;
  pttActive: boolean;
}

const PTTContext = createContext<PTTContextType | undefined>(undefined);

export const usePTT = () => {
  const context = useContext(PTTContext);
  if (context === undefined) {
    throw new Error("usePTT must be used within a PTTProvider");
  }
  return context;
};

interface PTTProviderProps {
  children: ReactNode; // Define the children prop to accept ReactNode
}

export const PTTProvider: React.FC<PTTProviderProps> = ({ children }) => {
  const [pttKey, setPttKey] = useState("Space");
  const [pttActive, setPttActive] = useState(false);
  const requiredSequence = "FISKGJUSE"; //EGG
  const [lastNineChars, setLastNineChars] = useState(""); //EGG
  const [eggState, setEggState] = useState(false); //EGG

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === " ") {
        event.preventDefault();
      }
      if (event.code === pttKey) {
        setPttActive(true);
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === pttKey) {
        setPttActive(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [pttKey]);

  useEffect(() => {
    //EGG
    const handleKeyDown = (event: KeyboardEvent) => {
      const { key } = event;
      setLastNineChars((prevChars) => (prevChars + key).slice(-9));
    };
    //console.log("sequence is: " + lastNineChars);

    const checkSequence = () => {
      if (lastNineChars.toUpperCase() === requiredSequence.toUpperCase()) {
        console.log("Created by:");
        console.log(
          ".------..------..------..------..------..------..------..------..------."
        );
        console.log(
          "|F.--. ||I.--. ||S.--. ||K.--. ||G.--. ||J.--. ||U.--. ||S.--. ||E.--. |"
        );
        console.log(
          "| :(): || (\\/) || :/\\: || :/\\: || :/\\: || :(): || (\\/) || :/\\: || (\\/) |"
        );
        console.log(
          "| ()() || :\\/: || :\\/: || :\\/: || :\\/: || ()() || :\\/: || :\\/: || :\\/: |"
        );
        console.log(
          "| '--'F|| '--'I|| '--'S|| '--'K|| '--'G|| '--'J|| '--'U|| '--'S|| '--'E|"
        );
        console.log(
          "`------'`------'`------'`------'`------'`------'`------'`------'`------'"
        );
        console.log(
          '"99% of gambling addicts quit right before they are about to hit it big."'
        );
        setEggState(true);
      }
    };

    checkSequence();

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [lastNineChars, requiredSequence]);

  return (
    <PTTContext.Provider value={{ pttKey, setPttKey, pttActive }}>
      {children}
    </PTTContext.Provider>
  );
};
