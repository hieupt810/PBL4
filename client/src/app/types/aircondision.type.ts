// export interface Television {
//     id: string;
//     name: string;
//     // mode?: string;
//   }
  
type mode = {
  id: string;
  mode: string;
};

export interface AirCondition {
  id: string;
  name: string;
  mode?: mode[];
}