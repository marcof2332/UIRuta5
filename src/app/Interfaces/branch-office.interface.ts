import { Time } from "@angular/common";
import { SpatialAttribute } from "./spatial-attribute.interface";

export interface BranchOffice {
  IdOffice            : number,
	BranchZone          : number,
  ZoneName            : string, //Para poder mostrar el nombre de la zona en la tabla.
	BranchAddress       : string,
  MarkerLocation?     : SpatialAttribute,
	Phone               : string,
	OpTime              : Time,
	CloseTime           : Time,
  CoordinateSystemId? : number,
  WellKnownValue?     : string,
}

