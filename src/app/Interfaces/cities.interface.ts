import { Zone } from "./zone.interface";

export interface City {
  IdCity        : number;
  CityName      : string;
  CityState     : number;
  StateName?    : string;
  Zones?        : Zone[];
}
