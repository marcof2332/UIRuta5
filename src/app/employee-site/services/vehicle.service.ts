import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { Vehicle } from 'src/app/Interfaces/vehicle.interface';
import { publicService } from 'src/app/public-services/public-service.service';
import { enviroments } from 'src/enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {

  private APIUrl: string = enviroments.APIUrl;
  private serviceRoute = 'vehicles';

  constructor(
    private http: HttpClient,
    private publicservice: publicService
    ) {}

  listVehicle(): Observable<Vehicle[]> {
    return this.http.get<Vehicle[]>(`${ this.APIUrl }` + this.serviceRoute )
      .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  addVehicle(v: Vehicle) {
    return this.http.post<Vehicle>(`${ this.APIUrl }` + this.serviceRoute, v)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  deleteVehicle(id: number) {
    return (this.http.delete(`${ this.APIUrl }` + this.serviceRoute + `?id=${id}`))
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  findVehicle(id: number) {
    return this.http.get<Vehicle>(`${ this.APIUrl }` + this.serviceRoute + `?id=${id}`)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  modifyVehicle(v: Vehicle) {
    return this.http.put<Vehicle>(`${ this.APIUrl }` + this.serviceRoute, v)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }
}
