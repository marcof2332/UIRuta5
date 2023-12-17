import { City } from "./cities.interface";

export interface State {
  IdState        : number;
  StateName      : string;
  Cities?         : City[];
}
