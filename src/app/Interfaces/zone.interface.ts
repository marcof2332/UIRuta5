import { BranchOffice } from "./branch-office.interface";
import { SpatialAttribute } from "./spatial-attribute.interface";

export interface Zone {
  IdZone              : number;
  ZoneName            : string;
  ZoneShape?          : SpatialAttribute;
  City                : number;
  CityName?           : string;
  CoordinateSystemId? : number;
  WellKnownValue?     : string;
  BranchOffices?       : BranchOffice[];
}
