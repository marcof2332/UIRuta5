
export interface SpatialAttribute
 {
    CoordinateSystemId: number;
    WellKnownText?: string;
    WellKnownValue?: string;
    Geography?: {
      CoordinateSystemId: number,
      WellKnownText?: string,
    }
}
