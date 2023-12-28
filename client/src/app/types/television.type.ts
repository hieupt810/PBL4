type mode = {
  id: string;
  mode: string;
};

export interface Television {
  id: string;
  name: string;
  mode?: mode;
}
