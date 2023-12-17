import { Component, Inject, Input, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { BranchOffice } from 'src/app/Interfaces/branch-office.interface';

@Component({
  selector: 'app-shared-simple-map',
  templateUrl: './shared-simple-map.component.html',
  styleUrls: ['./shared-simple-map.component.css']
})
export class SharedSimpleMapComponent implements OnInit {

  // Configuración de Google Maps
    center!: google.maps.LatLngLiteral;
    zoom = 13;
    markerPosition!: google.maps.LatLngLiteral;

    @Input() Office!: BranchOffice; //Recibo el item

    constructor(
      @Inject(MAT_DIALOG_DATA) public data: any,
      public dialogRef: MatDialogRef<SharedSimpleMapComponent>,
    ) { }

    onNoClick(): void {
      this.dialogRef.close(false);
    }

    ngOnInit(): void {
      console.log(this.data.Office)
      if (this.data.Office && this.data.Office.MarkerLocation) {
        const wkt = this.data.Office.MarkerLocation.Geography.WellKnownText;
        const [latStr ,lngStr] = wkt
          .substring(wkt.indexOf("(") + 1, wkt.lastIndexOf(")"))
          .split(" ");

        // Asigna las coordenadas a markerPosition como un objeto LatLngLiteral
        this.markerPosition = { lat: parseFloat(latStr), lng: parseFloat(lngStr) };
        console.log(this.markerPosition)
        // Centra el mapa en las coordenadas
        this.center = this.markerPosition;
      }
    }

}
