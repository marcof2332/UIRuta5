import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Package } from 'src/app/Interfaces/package.interface';
import { publicService } from 'src/app/public-services/public-service.service';
import { enviroments } from 'src/enviroments/enviroments';
import { Observable, catchError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PackagesService {

  private APIUrl: string = enviroments.APIUrl;
  private serviceRoute = 'package/addMany';

  constructor(
    private http: HttpClient,
    private publicservice: publicService
  ) { }

  addPackage(Package: Package): Observable<Package> {
    return this.http.post<Package>(`${ this.APIUrl }` + this.serviceRoute, Package)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  addManyPackages(Packages: Package[]): Observable<Package[]> {
    return this.http.post<Package[]>(`${ this.APIUrl }` + this.serviceRoute, Packages)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }
}
