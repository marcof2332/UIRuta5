import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { publicService } from 'src/app/public-services/public-service.service';
import { enviroments } from 'src/enviroments/enviroments';
import { City } from 'src/app/Interfaces/cities.interface';

@Injectable({
  providedIn: 'root'
})
export class CitiesService {

  private APIUrl: string = enviroments.APIUrl;
  private serviceRoute = 'cities';

  constructor(
    private http: HttpClient,
    private publicservice: publicService
    ) {}

  listCities(): Observable<City[]> {
    return this.http.get<City[]>(`${ this.APIUrl }` + this.serviceRoute);
  }

  addCity(cy: City) {
    return this.http.post<City>(`${ this.APIUrl }` + this.serviceRoute, cy)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  deleteCity(cy: number) {
    return (this.http.delete(`${ this.APIUrl }` + this.serviceRoute + `?cy=${cy}`))
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  modifyCity(cy: City) {
    return this.http.put<City>(`${ this.APIUrl }` + this.serviceRoute, cy)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }
}
