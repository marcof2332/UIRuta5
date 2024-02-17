import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { ShippmentList } from 'src/app/Interfaces/list-shippment.interface';
import { ShippmentStage } from 'src/app/Interfaces/shippment-stage.interface';
import { publicService } from 'src/app/public-services/public-service.service';
import { enviroments } from 'src/enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class ShippmentService {

  private APIUrl: string = enviroments.APIUrl;
  private serviceRoute = 'shippment';

  constructor(
    private http: HttpClient,
    private publicservice: publicService
    ) {}


  addShippmentStages(shippmentStage: ShippmentStage): Observable<ShippmentStage> {
    return this.http.post<ShippmentStage>(`${ this.APIUrl }` + this.serviceRoute + "/addstage", shippmentStage)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  listallShippmentStages(): Observable<ShippmentStage[]> {
    return this.http.get<ShippmentStage[]>(`${ this.APIUrl }` + this.serviceRoute)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

}

