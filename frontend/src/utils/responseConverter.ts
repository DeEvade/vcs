interface Olddata {
  id: number;
  order: number;
  frequency: {
    id: number;
    frequency: string;
  };
}
interface Newdata {
  id: number;
  frequency: string;
  order: number;
}

export const roleFrequencyToFrequency = (
  roleFrequency: Olddata[]
): Newdata[] => {
  return roleFrequency.map((roleFrequency) => ({
    id: roleFrequency.frequency.id,
    frequency: roleFrequency.frequency.frequency,
    order: roleFrequency.order,
  })) as Newdata[];
};
