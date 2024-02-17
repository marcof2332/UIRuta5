import { CommonModule } from '@angular/common';  
import { BrowserModule } from '@angular/platform-browser';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedSimpleMapComponent } from '../shared-simple-map/shared-simple-map.component';
import { FormGroup } from '@angular/forms';
import { HomePickup } from 'src/app/Interfaces/home-pickup.interface';
import { DropOff } from 'src/app/Interfaces/drop-off.interface';
import { ShippmentStage } from 'src/app/Interfaces/shippment-stage.interface';
import { SharedmapdataService } from '../../services/sharedmapdata.service';

@Component({
  selector: 'app-shippment-details',
  templateUrl: './shippment-details.component.html',
  styleUrls: ['./shippment-details.component.css']
})

export class ShippmentDetailsComponent implements OnInit { 

  @Input() myForm!: FormGroup; //Validadores del formulario
  @Input() item!: ShippmentStage; //Valores del formulario
  @Input() resulthp?: HomePickup; //Valores del formulario
  @Input() resultdp?: DropOff; //Valores del formulario

  zoom = 12;
  retirementZoneMarkerPosition!: google.maps.LatLngLiteral;
  retirementcenter!: google.maps.LatLngLiteral;

  shipmentZoneMarkerPosition!: google.maps.LatLngLiteral;
  shipmentcenter!: google.maps.LatLngLiteral;

  constructor(
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SharedSimpleMapComponent>,
    private mapconvert: SharedmapdataService,
  ) {}

    ngOnInit(): void {
      this.myForm = this.data.form;
      this.item = this.data.item;
      if(this.data.full.IdHomePickup != null)
      {
        this.resulthp = this.data.full;
        
        const wkt = this.data.full.PickUpLocation.Geography.WellKnownText;
        const [latStr ,lngStr] = wkt
          .substring(wkt.indexOf("(") + 1, wkt.lastIndexOf(")"))
          .split(" ");

        // Asigna las coordenadas a markerPosition como un objeto LatLngLiteral
        this.retirementZoneMarkerPosition = { lat: parseFloat(lngStr), lng: parseFloat(latStr) };

        const wktr2 = this.data.full.Shippments.TargetLocation.Geography.WellKnownText;
        const [lat ,lng] = wktr2
        .substring(wkt.indexOf("(") + 1, wkt.lastIndexOf(")"))
        .split(" ");
        // Asigna las coordenadas a markerPosition como un objeto LatLngLiteral
        this.shipmentZoneMarkerPosition = { lat: parseFloat(lng), lng: parseFloat(lat) };

        // Centra el mapa en las coordenadas
        this.retirementcenter = this.retirementZoneMarkerPosition;
        this.shipmentcenter = this.shipmentZoneMarkerPosition;
      }
      else if((this.data.full.IdDropOff != null))
      {
        this.resultdp = this.data.full;
        const wkt = this.data.full.Shippments.TargetLocation.Geography.WellKnownText;
        const [latStr ,lngStr] = wkt
        .substring(wkt.indexOf("(") + 1, wkt.lastIndexOf(")"))
        .split(" ");

        // Asigna las coordenadas a markerPosition como un objeto LatLngLiteral
        this.shipmentZoneMarkerPosition = { lat: parseFloat(lngStr), lng: parseFloat(latStr) };
        // Centra el mapa en las coordenadas
        this.shipmentcenter = this.shipmentZoneMarkerPosition;
      }
      else
      {
        this.showSnackBar('Ocurrio un error al mostrar el envío.')
      }
    }

    //Metodo para mostrar un snackbar con un mensaje
    showSnackBar(message: string): void {
      this.snackBar.open(message, 'cerrar', {
        duration: 4000,
      })
    }

    onNoClick(): void {
      this.dialogRef.close(false);
    }

}
