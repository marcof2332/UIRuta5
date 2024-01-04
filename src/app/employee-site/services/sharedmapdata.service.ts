import { Injectable } from '@angular/core';
import { SpatialAttribute } from 'src/app/Interfaces/spatial-attribute.interface';
import { Zone } from 'src/app/Interfaces/zone.interface';

@Injectable({
  providedIn: 'root'
})
export class SharedmapdataService {

  constructor() { }

  convertLatLngLiteralToGeoPolygon(coordinates: google.maps.LatLngLiteral[]): SpatialAttribute | null {
    // Verifica que haya al menos 3 coordenadas
    if (coordinates.length < 3) {
      console.error('Debe proporcionar al menos 3 coordenadas para crear un polígono.');
      return null;
    }
    
    const wellKnownText = `POLYGON((${coordinates.map(coord => `${coord.lat} ${coord.lng}`).join(', ')}))`;
    
    const geoPolygon: SpatialAttribute = {
        CoordinateSystemId: 4326,
        WellKnownText: wellKnownText,
        WellKnownValue: wellKnownText,
    };
    return geoPolygon;
  }

  convertLatLngLiteralToGeoPoint(coord: google.maps.LatLngLiteral): SpatialAttribute | null {
    const wellKnownText = `POINT(${coord.lng} ${coord.lat})`;

    const geoPoint: SpatialAttribute = {
        CoordinateSystemId: 4326,
        WellKnownText: wellKnownText,
        WellKnownValue: wellKnownText,
    };

    return geoPoint;
  }

  // Función para calcular el centro de un conjunto de coordenadas
  calculateCenter(coords: google.maps.LatLngLiteral[]): google.maps.LatLngLiteral {
    if (coords.length === 0) {
      return { lat: 0, lng: 0 }; // Coordenadas iniciales si no hay datos
    }
    const latSum = coords.reduce((sum, coord) => sum + coord.lat, 0);
    const lngSum = coords.reduce((sum, coord) => sum + coord.lng, 0);
    const latCenter = latSum / coords.length;
    const lngCenter = lngSum / coords.length;
    return { lat: latCenter, lng: lngCenter };
  }

    // Extrae las coordenadas del campo WellKnownText manualmente
  convertToLatLangLiteral(zone: Zone)
  {
    const coordinates: google.maps.LatLngLiteral[] = [];
    if(zone && zone.ZoneShape && zone.ZoneShape.Geography?.WellKnownText) {
      const wkt = zone.ZoneShape.Geography?.WellKnownText;
      const coordinateStrings = wkt.substring(wkt.indexOf("((") + 2, wkt.lastIndexOf("))")).split(", ");
      coordinateStrings.forEach((coordStr: string) => {
        const [latStr, lngStr] = coordStr.split(" ");
        coordinates.push({
          lat: parseFloat(latStr),
          lng: parseFloat(lngStr)
        });
      });
      return coordinates;
    }
    else
      return coordinates;
  }
}
