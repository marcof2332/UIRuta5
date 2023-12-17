import { SpatialAttribute } from "./spatial-attribute.interface";
import { Shippment } from './shippment.interface';

export interface ShippmentList {

    HomeOrDrop?        :string;

    IdHomePickup?     : number;
    StartTime?        : Date;
    EndTime?          : Date;
    Note?             : string;
    PickupAddress?    : string;
    PickUpLocation?   : SpatialAttribute;
    BranchOffice?     : number;
    note?             : string;
    PickUpZone?       : number;

    IdShippment?        : number;
    ReceiptDate?         : Date;
    Sender?              : number;
    Recipient?           : number;
    RecipientCel?        : string;
    TargetZone?          : number;
    TargetAddress?       : string;
    TargetLocation?     : SpatialAttribute, //To show

    Shippments?        : Shippment; //To receive
}
