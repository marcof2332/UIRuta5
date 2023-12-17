import { ApiLocation } from "./apiLocation.interface";

export interface Route {
  shippmentId: number;
  routeDate: Date;
  firstAddress: ApiLocation;
  lastAddress: ApiLocation;
  otherAddress: ApiLocation[];
  createdAt: Date;
  updatedAt: Date;
}
