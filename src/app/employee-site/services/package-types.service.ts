import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { enviroments } from 'src/enviroments/enviroments';


import { publicService } from 'src/app/public-services/public-service.service';

import { PackageType } from 'src/app/Interfaces/package-type.interface';


@Injectable({
  providedIn: 'root'
})
export class PackageTypesService {

  private APIUrl: string = enviroments.APIUrl;
  private serviceRoute = 'packagetype';

  constructor(
    private http: HttpClient,
    private publicservice: publicService
    ) {}

  listPType(): Observable<PackageType[]> {
    return this.http.get<PackageType[]>(`${ this.APIUrl }` + this.serviceRoute )
      .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  addPType(PT: PackageType) {
    return this.http.post<PackageType>(`${ this.APIUrl }` + this.serviceRoute, PT)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  deletePType(id: number) {
    return (this.http.delete(`${ this.APIUrl }` + this.serviceRoute + `?id=${id}`))
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  findPType(id: number) {
    return this.http.get<PackageType>(`${ this.APIUrl }` + this.serviceRoute + `?id=${id}`)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  modifyPType(PT: PackageType) {
    return this.http.put<PackageType>(`${ this.APIUrl }` + this.serviceRoute, PT)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }
}
