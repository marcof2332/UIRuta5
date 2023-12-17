import { Component, Inject, Input, OnInit, Output, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Zone } from 'src/app/Interfaces/zone.interface';
import { SharedmapdataService } from '../../services/sharedmapdata.service';

@Component({
  selector: 'app-shared-zone-map',
  templateUrl: './shared-zone-map.component.html',
  styleUrls: ['./shared-zone-map.component.css']
})
export class SharedZoneMapComponent implements OnInit {

  center = { lat: -34.63999627181617, lng: -56.06497850140106 };
  zoom = 11;

  @Input() Zone!: Zone; //Recibo el item

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SharedZoneMapComponent>,
    private mapService: SharedmapdataService
  ) {}

  markerOptions: google.maps.MarkerOptions = {draggable: false};
  markerPositions: google.maps.LatLngLiteral[] = [];
  polygonPoints: google.maps.LatLngLiteral[] = [];
  //Seleccionar marker para cerrar el poligono
  selectedMarkerIndex: number | null = null;

  ngOnInit(): void {

      if (this.data.Zone && this.data.Zone.ZoneShape) {

        // Extrae las coordenadas del campo WellKnownText manualmente
        const wkt = this.data.Zone.ZoneShape.Geography.WellKnownText;
        const coordinateStrings = wkt.substring(wkt.indexOf("((") + 2, wkt.lastIndexOf("))")).split(", ");
        const coordinates = coordinateStrings.map((coordStr: string) => {
          const [latStr, lngStr] = coordStr.split(" ");
          return {
            lat: parseFloat(latStr),
            lng: parseFloat(lngStr)
          };
        });

      // Asigna coordinates a polygonPoints
      this.polygonPoints = coordinates;

      const center = this.mapService.calculateCenter(this.polygonPoints);
      this.center = center;
      }
  }

  // // Función para calcular el centro de un conjunto de coordenadas
  // calculateCenter(coords: google.maps.LatLngLiteral[]): google.maps.LatLngLiteral {
  //   if (coords.length === 0) {
  //     return { lat: 0, lng: 0 }; // Coordenadas iniciales si no hay datos
  //   }
  //   const latSum = coords.reduce((sum, coord) => sum + coord.lat, 0);
  //   const lngSum = coords.reduce((sum, coord) => sum + coord.lng, 0);
  //   const latCenter = latSum / coords.length;
  //   const lngCenter = lngSum / coords.length;
  //   return { lat: latCenter, lng: lngCenter };
  // }

  onNoClick(): void {
    this.dialogRef.close(false);
  }
}
