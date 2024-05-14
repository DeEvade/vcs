interface Olddata {
  id: number;
  order: number;
  isPrimary: boolean;
  frequency: {
    id: number;
    frequency: string;
  };
}
interface Newdata {
  id: number;
  frequency: string;
  order: number;
  isPrimary: boolean;
}

export const roleFrequencyToFrequency = (
  roleFrequency: Olddata[]
): Newdata[] => {
  return roleFrequency.map((roleFrequency) => ({
    id: roleFrequency.frequency.id,
    frequency: roleFrequency.frequency.frequency,
    order: roleFrequency.order,
    isPrimary: roleFrequency.isPrimary,
  })) as Newdata[];
};
