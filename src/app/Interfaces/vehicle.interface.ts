export interface Vehicle {
  IdVehicle           : number;
  Plate               : string;
  vRegistration       : string;
  BrandModel          : string;
  VehicleWeight       : number;
  Condition           : number;
  CondName?           : string; // Nuevo campo para el nombre del estado
}
