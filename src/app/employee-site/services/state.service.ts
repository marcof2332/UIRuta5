import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { publicService } from 'src/app/public-services/public-service.service';
import { enviroments } from 'src/enviroments/enviroments';
import { State } from 'src/app/Interfaces/state.interface';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private APIUrl: string = enviroments.APIUrl;
  private serviceRoute = 'states';

  constructor(
    private http: HttpClient,
    private publicservice: publicService
    ) {}

  listStates(): Observable<State[]> {
    return this.http.get<State[]>(`${ this.APIUrl }` + this.serviceRoute )
      .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  addStates(st: State) {
    return this.http.post<State>(`${ this.APIUrl }` + this.serviceRoute, st)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  deleteState(st: number) {
    return (this.http.delete(`${ this.APIUrl }` + this.serviceRoute + `?st=${st}`))
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }

  modifyState(st: State) {
    return this.http.put<State>(`${ this.APIUrl }` + this.serviceRoute, st)
    .pipe(catchError((error) => this.publicservice.handleError(error)));
  }
}
