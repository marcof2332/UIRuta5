import { Injectable } from '@angular/core';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { enviroments } from 'src/enviroments/enviroments';
import { publicService } from 'src/app/public-services/public-service.service';
import { VehicleCondition } from 'src/app/Interfaces/vehicle-condition.interface';

@Injectable({
  providedIn: 'root'
})
export class VehicleConditionService {

  private APIUrl: string = enviroments.APIUrl;
  private serviceRoute = 'vehiclec';

  constructor(
    private http: HttpClient,
    private publicservice: publicService
    ) {}

  listVCondition(): Observable<VehicleCondition[]> {
    return this.http.get<VehicleCondition[]>(`${ this.APIUrl }` + this.serviceRoute )
      .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  addVCondition(vc: VehicleCondition) {
    return this.http.post<VehicleCondition>(`${ this.APIUrl }` + this.serviceRoute, vc)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  deleteVCondition(id: number) {
    return (this.http.delete(`${ this.APIUrl }` + this.serviceRoute + `?id=${id}`))
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  findVCondition(id: number) {
    return this.http.get<VehicleCondition>(`${ this.APIUrl }` + this.serviceRoute + `?id=${id}`)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  modifyVCondition(vc: VehicleCondition) {
    return this.http.put<VehicleCondition>(`${ this.APIUrl }` + this.serviceRoute, vc)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }
}
