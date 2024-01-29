export interface ShippmentStage {
    IdShSt?: number;
    ShippmentID: number;
    StageID: number;
    EmployeeID: number;
    DateTimeStage: Date;
    RouteShapeID?: number | null;
    VehicleID?: number | null;
  }