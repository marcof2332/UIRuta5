import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError } from 'rxjs';
import { DropOff } from 'src/app/Interfaces/drop-off.interface';
import { publicService } from 'src/app/public-services/public-service.service';
import { enviroments } from 'src/enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class DropoffService {

  private APIUrl: string = enviroments.APIUrl;
  private serviceRoute = 'dropoff';

  constructor(
    private http: HttpClient,
    private publicservice: publicService
    ) {}

  findDropOff(id: number) {
    return this.http.get<DropOff>(`${ this.APIUrl }` + this.serviceRoute + `?id=${id}`)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  addDropOff(dp: DropOff ) {
    return this.http.post<number>(`${ this.APIUrl }` + this.serviceRoute, dp)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }
}
