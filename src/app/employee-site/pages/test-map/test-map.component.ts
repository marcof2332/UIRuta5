import { Component } from '@angular/core';

@Component({
  selector: 'app-test-map',
  templateUrl: './test-map.component.html',
  styleUrls: ['./test-map.component.css']
})
export class TestMapComponent {

  center = { lat: -34.63999627181617, lng: -56.06497850140106 };
  zoom = 4;

  markerOptions: google.maps.MarkerOptions = {draggable: false};
  markerPositions: google.maps.LatLngLiteral[] = [];
  polygonPoints: google.maps.LatLngLiteral[] = [];


  //Seleccionar marker para cerrar el poligono
  selectedMarkerIndex: number | null = null;

  addMarker(event: google.maps.MapMouseEvent) {
    if(event.latLng != null) {
      this.markerPositions.push(event.latLng.toJSON());
      this.polygonPoints = [...this.polygonPoints, event.latLng.toJSON()];
      console.log(this.polygonPoints);
    }
    else
    { console.log(console.error()) }
  }

  markerClick(markerIndex: number) {
    if (this.selectedMarkerIndex === markerIndex) {
      // Si se hace clic en el marcador seleccionado nuevamente, lo deseleccionamos.
      this.selectedMarkerIndex = null;
    } else {
      // Si se hace clic en un nuevo marcador, lo seleccionamos y cerramos el polígono.
      this.selectedMarkerIndex = markerIndex;

      // Agrega el primer punto al final del arreglo para cerrar el polígono.
      this.polygonPoints.push(this.polygonPoints[0]);
    }
  }

  removeLastMarker() {
    if (this.markerPositions.length > 0) {
      const lastMarkerIndex = this.markerPositions.length - 1;
      this.removeMarker(lastMarkerIndex);
    }
  }

  removeMarker(markerIndex: number) {
    if (markerIndex >= 0 && markerIndex < this.markerPositions.length) {
      this.markerPositions.splice(markerIndex, 1);
      this.polygonPoints = this.markerPositions.slice(); // Actualiza el polígono con las posiciones restantes.
      this.selectedMarkerIndex = null; // Deselecciona cualquier marcador seleccionado.
    }
  }

  clearPolygon() {
    this.polygonPoints = []; // Limpia el arreglo de puntos del polígono
    this.markerPositions = [];
  }
}
