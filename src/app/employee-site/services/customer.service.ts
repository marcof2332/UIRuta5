import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { Customer } from 'src/app/Interfaces/customers.interface';
import { publicService } from 'src/app/public-services/public-service.service';
import { enviroments } from 'src/enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private APIUrl: string = enviroments.APIUrl;
  private serviceRoute = 'customers';

  constructor(
    private http: HttpClient,
    private publicservice: publicService
    ) {}

  listCustomer(): Observable<Customer[]> {
    return this.http
      .get<Customer[]>(`${ this.APIUrl }` + this.serviceRoute )
      .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  addCustomer(c: Customer ) {
    return this.http.post<Customer>(`${ this.APIUrl }` + this.serviceRoute, c)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  modifyCustomer(c: Customer ) {
    return this.http.put<Customer>(`${ this.APIUrl }` + this.serviceRoute, c)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

}
