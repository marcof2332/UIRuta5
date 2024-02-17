import { Employee } from "./employee.interface";
import { Shippment } from "./shippment.interface";
import { Stage } from "./stage.interface";
import { Vehicle } from "./vehicle.interface";
//import { Stage } from "stage"
export interface ShippmentStage {
    IdShSt?: number;
    IdShippment: number;
    IdSStage: number;
    EmpID: number;
    DateTimeStage: Date;
    RouteShape?: number | null;
    Vehicle?: number | null;
    ShType?: boolean | null;

    Employees?: Employee;
    Shippments?: Shippment;
    Stages?: Stage;
    Vehicles?: Vehicle;

    StageDescription?: string;
    Plate?: string;
  }