import { Component, Input, OnInit } from '@angular/core';
import { Route } from '../component-interfaces/route.interface';
import { PointMap } from '../component-interfaces/pointmap.interface';
import { ApiLocation } from '../component-interfaces/apiLocation.interface';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'shared-route-map',
  templateUrl: './shared-route-map.component.html',
  styleUrls: ['./shared-route-map.component.css']
})
export class SharedMapComponent implements OnInit {

  @Input()
  route!: Route;
  showDetail: boolean = false;

  request: any;
  init!: google.maps.LatLng;
  dest!: google.maps.LatLng;
  waypts: Array<google.maps.DirectionsWaypoint> = [];
  intr: Array<google.maps.LatLng> = [];
  mapLegs!: google.maps.DirectionsLeg[];

  directionsService = new google.maps.DirectionsService();
  directionsRenderer = new google.maps.DirectionsRenderer();
  directionRoute?: google.maps.DirectionsRoute ;

  points: Array<PointMap> = [];
  distance: number = 0;
  time!: string;

  constructor(
    private snackBar: MatSnackBar,
  ) {}

  //Metodo para mostrar un snackbar con un mensaje
  showSnackBar( message: string ): void {
    this.snackBar.open( message, 'cerrar', {
      duration: 4000,
    })
  }

  ngOnInit(): void {

    this.init = new google.maps.LatLng({ lat: this.route.firstAddress.latitude, lng: this.route.firstAddress.longitude });
    this.dest = new google.maps.LatLng({ lat: this.route.lastAddress.latitude, lng: this.route.lastAddress.longitude });

    for (let i = 0; i < this.route.otherAddress.length; i++)
      this.intr.push(new google.maps.LatLng({ lat: this.route.otherAddress[i].latitude, lng: this.route.otherAddress[i].longitude }));

    for (let i = 0; i < this.intr.length; i++)
      this.waypts.push({ location: this.intr[i], stopover: true, })

    this.request = {
      origin: this.init,
      destination: this.dest,
      waypoints: this.waypts,
      durationInTraffic: true,
      optimizeWaypoints: true,
      travelMode: google.maps.TravelMode.DRIVING,
    };
    this.initMap();
  }

  viewDetail() {
    const directions = this.directionsRenderer.getDirections();
      if (directions) {
        const route = directions.routes[0];
        if (route) {
          this.directionRoute = route;
          this.points = [];
          this.distance = 0;
          let seconds = 0
          for (let i = 0; i < this.directionRoute.legs.length; i++) {
            let leg = this.directionRoute.legs[i];
            // Comprobar si 'leg.distance' y 'leg.duration' son definidos
            if (leg.distance && leg.duration) {
            this.distance += leg.distance.value;
            seconds += leg.duration.value;
            const startLocation: ApiLocation = {address: leg.start_address, latitude: leg.start_location.lat(), longitude: leg.start_location.lng() }
            const endLocation: ApiLocation = {address: leg.end_address, latitude: leg.end_location.lat(), longitude: leg.end_location.lng() }
            const newPoint: PointMap = { id: i, distance: leg.distance.text, duration: leg.duration.text, startLocation: startLocation, endLocation: endLocation }
            this.points.push(newPoint);
          } else {
            console.log('// Manejo en caso de que leg.distance o leg.duration sean nulos o indefinidos');
          }
        }
          this.time = convertToTime(seconds);
          this.showDetail = true;
        }
        else {
          console.log('// Manejo en caso de que route sea nulo');
        }
    }
    else {
      console.log('// Manejo en caso de que directions sea nulo');
    }
  }

  initMap(): void {
    const map = new google.maps.Map(
      document.getElementById("map") as HTMLElement,
      {
        zoom: 12,
        center: { lat: -34.89375586007404, lng: -56.16532905536134 },
      }
    );
    this.calculateAndDisplayRoute(this.directionsService, this.directionsRenderer);
    this.directionsRenderer.setMap(map);
  }

  calculateAndDisplayRoute(directionsService: google.maps.DirectionsService, directionsRenderer: google.maps.DirectionsRenderer) {
    directionsService.route(this.request, (response, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(response);
      } else {
        this.showSnackBar('Error al cargar la ruta.');
      }
    });

    directionsService.route(this.request, (response, status) => {
      if (status === google.maps.DirectionsStatus.OK) {
        directionsRenderer.setDirections(response);
      } else {
        this.showSnackBar('Error al cargar la ruta.');
      }
    });
  }

}

function convertToTime(seconds: number): string {
  seconds = Number(seconds);
  var h = Math.floor(seconds % (3600*24) / 3600);
  var m = Math.floor(seconds % 3600 / 60);

  var hDisplay = h > 0 ? h + " hora" : "";
  var mDisplay = m > 0 ? m + (m == 1 ? " minuto " : " minutos, ") : "";
  return hDisplay + " " + mDisplay;
}
