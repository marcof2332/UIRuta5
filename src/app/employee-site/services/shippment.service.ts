import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { ShippmentList } from 'src/app/Interfaces/list-shippment.interface';
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

  listAllShippments(): Observable<ShippmentList[]> {
    return this.http.get<ShippmentList[]>(`${ this.APIUrl }` + this.serviceRoute)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

}

