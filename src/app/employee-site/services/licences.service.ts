import { Injectable } from '@angular/core';
import { Licence } from '../../Interfaces/licence.interface';
import { Observable, catchError, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { enviroments } from 'src/enviroments/enviroments';
import { Router } from '@angular/router';
import { publicService } from 'src/app/public-services/public-service.service';

@Injectable({
  providedIn: 'root'
})
export class LicencesService {

  private APIUrl: string = enviroments.APIUrl;
  private serviceRoute = 'licences';

  constructor(
    private http: HttpClient,
    private publicservice: publicService
    ) {}

  listLicences(): Observable<Licence[]> {
    return this.http.get<Licence[]>(`${ this.APIUrl }` + this.serviceRoute )
      .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  addLicence(li: Licence) {
    return this.http.post<Licence>(`${ this.APIUrl }` + this.serviceRoute, li)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  deleteLicence(cat: string) {
    return (this.http.delete(`${ this.APIUrl }` + this.serviceRoute + `?cat=${cat}`))
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  findLicence(cat: string) {
    return this.http.get<Licence>(`${ this.APIUrl }` + this.serviceRoute + `?cat=${cat}`)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  modifyLicence(li: Licence) {
    return this.http.put<Licence>(`${ this.APIUrl }` + this.serviceRoute, li)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }
}
