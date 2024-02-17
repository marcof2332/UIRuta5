import { Shippment } from "../Interfaces/shippment.interface";
import { BranchOffice } from "./branch-office.interface";

export interface DropOff {
    IdDropOff?       : number;
    BranchOffice    : number;
    Note?           : string | null;
    Shippments?     : Shippment;

    BranchOffices?  : BranchOffice;
}