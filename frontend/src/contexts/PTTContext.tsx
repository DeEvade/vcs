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
        console.log(" _____                              _____");
        console.log("|F    | _____                _____ |J    |");
        console.log("|     ||I    | _____        |G    || & & | ");
        console.log("|  &  ||  &  ||S    | _____ | & & || & & | _____");
        console.log("|     ||     || & & ||K    ||  &  || & & ||U    |");
        console.log("|____F||  &  ||     || & & || & & ||____J|| & & | _____");
        console.log(
          "       |____I||  &  ||     ||____G|       |& & &||S    | _____"
        );
        console.log(
          "              |____S|| & & |              | & & ||& & &||E    |"
        );
        console.log(
          "                     |____K|              |____U|| & & ||& & &|"
        );
        console.log(
          "                                                 |& & &||& & &|"
        );
        console.log(
          "                                                 |____S||& & &|"
        );
        console.log(
          "                                                        |____E|"
        );
        console.log(
          '"99% of gambling addicts quit right before they are about to hit it big."'
        );
        console.log(
          '"Omsätt och få 100 % bonus upp till 4 000 kr + 100 gratisspins på MGM Grand Gamble."'
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
