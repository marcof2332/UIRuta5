import { Shippment } from "../Interfaces/shippment.interface";
import { SpatialAttribute } from "./spatial-attribute.interface";
import { Zone } from "./zone.interface";

export interface HomePickup {
    IdHomePickup?: number;
    StartTime?: Date | null;
    EndTime?: Date | null;
    Note?: string | null;
    PickupAddress: string;
    PickUpZone : number;
    Shippments?: Shippment;
    Latitude   : number;
    Longitude  : number;

    PickUpLocation? : SpatialAttribute;
    Zones?           : Zone;
  }