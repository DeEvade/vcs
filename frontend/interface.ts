interface Role {
  id: number;
  name: string;
  type: "ATC" | "pilot";
  frequencies: Frequency[];
}

interface Frequency {
  id: number;
  frequency: string;
  roles: Role[];
}

interface Configuration {
  id: number;
  name: string;
  roles: Role[];
  frequencies: Frequency[];
}
