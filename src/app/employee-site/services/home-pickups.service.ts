import { Employee } from './../../Interfaces/employee.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { HomePickup } from 'src/app/Interfaces/home-pickup.interface';
import { publicService } from 'src/app/public-services/public-service.service';
import { enviroments } from 'src/enviroments/enviroments';

@Injectable({providedIn: 'root'})
export class HomePickupsService {

  private APIUrl: string = enviroments.APIUrl;
  private serviceRoute = 'homepickups';

  constructor(
    private http: HttpClient,
    private publicservice: publicService
    ) {}

  addHomePickup(homePickup: HomePickup ) {
    return this.http.post<number>(`${ this.APIUrl }` + this.serviceRoute, homePickup)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  findHomePickup(id: number) {
    return this.http.get<HomePickup>(`${ this.APIUrl }` + this.serviceRoute + `?id=${id}`)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }
}
