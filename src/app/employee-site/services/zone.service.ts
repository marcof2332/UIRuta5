import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { Zone } from 'src/app/Interfaces/zone.interface';
import { publicService } from 'src/app/public-services/public-service.service';
import { enviroments } from 'src/enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class ZoneService {

  private APIUrl: string = enviroments.APIUrl;
  private serviceRoute = 'zones';

  constructor(
    private http: HttpClient,
    private publicservice: publicService
    ) {}

  listZone(): Observable<Zone[]> {
    return this.http.get<Zone[]>(`${ this.APIUrl }` + this.serviceRoute )
      .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  addZone(zo: Zone) {
    console.log(zo);
    return this.http.post<Zone>(`${ this.APIUrl }` + this.serviceRoute, zo)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  deleteZone(zo: number) {
    return (this.http.delete(`${ this.APIUrl }` + this.serviceRoute + `?zo=${zo}`))
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  findZone(id: number) {
    return this.http.get<Zone>(`${ this.APIUrl }` + this.serviceRoute + `?id=${id}`)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  modifyZone(zo: Zone) {
    return this.http.put<Zone>(`${ this.APIUrl }` + this.serviceRoute, zo)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }
}
