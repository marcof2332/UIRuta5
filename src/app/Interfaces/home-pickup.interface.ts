import { Shippment } from "../Interfaces/shippment.interface";

export interface HomePickup {
    IdHomePickup?: number;
    StartTime?: Date | null;
    EndTime?: Date | null;
    Note?: string | null;
    PickupAddress: string;
    PickupZone : number;
    Shippments?: Shippment;
    Latitude   : number;
    Longitude  : number;
  }