import { Customer } from "./customers.interface";
import { SpatialAttribute } from "./spatial-attribute.interface";
import { Zone } from "./zone.interface";

export interface Shippment {
    IdShippment         : number;
    ReceiptDate         : Date;
    Sender              : number;
    Recipient           : number;
    RecipientCel        : string;
    TargetZone          : number;
    TargetAddress       : string;
    TargetLocation?     : SpatialAttribute, //To show
    CoordinateSystemId? : number, //To add
    WellKnownValue?     : string, //To add
}
