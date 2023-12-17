import { ApiLocation } from "./apiLocation.interface";

export interface PointMap {
  id: number;
  distance: string;
  duration: string;
  startLocation: ApiLocation;
  endLocation: ApiLocation;
}
