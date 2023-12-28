type mode = {
  id: string;
  mode: string;
};

export interface Light {
  id: string;
  name: string;
  mode: mode[];
  pin: number;
}
