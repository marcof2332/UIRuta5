export interface Shippment {
    IdShippment?        : number;
    ReceiptDate         : Date;
    Sender              : number;
    Recipient           : number;
    RecipientCel        : string;
    TargetZone          : number;
    TargetAddress       : string;
    Latitude            : number;
    Logitude            : number;
}
