import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';

import { ShippmentList } from 'src/app/Interfaces/list-shippment.interface';

import { Role } from 'src/app/Interfaces/role.interface';
import { publicService } from 'src/app/public-services/public-service.service';
import { enviroments } from 'src/enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class RoleService {

  private APIUrl: string = enviroments.APIUrl;
  private serviceRoute = 'roles';

  constructor(
    private http: HttpClient,
    private publicservice: publicService
    ) { }

  listRoles(): Observable<Role[]> {
    return this.http.get<Role[]>(`${ this.APIUrl }` + this.serviceRoute)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  addRole( ro: Role ) {
    return this.http.post<Role>(`${ this.APIUrl }` + this.serviceRoute, ro)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  modifyRole( ro: Role ) {
    return this.http.put<Role>(`${ this.APIUrl }` + this.serviceRoute, ro)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  deleteRole(ro: string) {
    return (this.http.delete(`${ this.APIUrl }` + this.serviceRoute + `?ro=${ro}`))
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }
}
