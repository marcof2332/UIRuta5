import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { BranchOffice } from 'src/app/Interfaces/branch-office.interface';
import { publicService } from 'src/app/public-services/public-service.service';
import { enviroments } from 'src/enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class BranchOfficeService {

  private APIUrl: string = enviroments.APIUrl;
  private serviceRoute = 'branchoffices';

  constructor(
    private http: HttpClient,
    private publicservice: publicService
    ) {}

  listOffices(): Observable<BranchOffice[]> {
    return this.http.get<BranchOffice[]>(`${ this.APIUrl }` + this.serviceRoute)
      .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  addOffice(cy: BranchOffice) {
    return this.http.post<BranchOffice>(`${ this.APIUrl }` + this.serviceRoute, cy)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  deleteOffice(id: number) {
    return (this.http.delete(`${ this.APIUrl }` + this.serviceRoute + `?id=${id}`))
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  modifyOffice(b: BranchOffice) {
    return this.http.put<BranchOffice>(`${ this.APIUrl }` + this.serviceRoute, b)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }
}
