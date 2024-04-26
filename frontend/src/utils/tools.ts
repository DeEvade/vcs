import { Frequency, Role } from "@/types";

export const rolesToFrequencies = (roles: Role[] | null): Frequency[] => {
  if (roles == null) return [];

  //Remove duplicates
  const arr: Frequency[] = [];

  for (const role of roles) {
    for (const frequency of role.frequencies) {
      if (!arr.find((f) => f.id === frequency.id)) {
        arr.push(frequency);
      }
    }
  }

  return arr;
};
