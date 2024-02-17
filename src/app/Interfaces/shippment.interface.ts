import { SpatialAttribute } from "./spatial-attribute.interface";
import { Zone } from "./zone.interface";

export interface Shippment {
    IdShippment?        : number;
    ReceiptDate         : Date;
    Sender              : number;
    Recipient           : number;
    RecipientCel        : string;
    TargetZone          : number;
    TargetAddress       : string;
    Latitude?           : number;
    Longitude?           : number;

    TargetLocation?     : SpatialAttribute;
    Zones?              : Zone;
}
