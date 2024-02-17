import { Employee } from './../../Interfaces/employee.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { publicService } from 'src/app/public-services/public-service.service';
import { enviroments } from 'src/enviroments/enviroments';

@Injectable({providedIn: 'root'})
export class EmployeeService {

  private APIUrl: string = enviroments.APIUrl;
  private serviceRoute = 'employees';

  constructor(
    private http: HttpClient,
    private publicservice: publicService
    ) {}

  listEmployees(): Observable<Employee[]> {
    return this.http
      .get<Employee[]>(`${ this.APIUrl }` + this.serviceRoute )
      .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  addEmployee(Emp: Employee ) {
    return this.http.post<Employee>(`${ this.APIUrl }` + this.serviceRoute, Emp)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  modifyEmployee(Emp: Employee ) {
    return this.http.put<Employee>(`${ this.APIUrl }` + this.serviceRoute, Emp)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  deleteEmployee(emp: number) {
    return (this.http.delete(`${ this.APIUrl }` + this.serviceRoute + `?emp=${emp}`))
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

}
