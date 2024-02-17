import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError } from 'rxjs';
import { Stage } from 'src/app/Interfaces/stage.interface';
import { publicService } from 'src/app/public-services/public-service.service';
import { enviroments } from 'src/enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class StagesService {

  private APIUrl: string = enviroments.APIUrl;
  private serviceRoute = 'stages';

  constructor(
    private http: HttpClient,
    private publicservice: publicService
    ) {}

    listStages(): Observable<Stage[]> {
      return this.http.get<Stage[]>(`${ this.APIUrl }` + this.serviceRoute )
        .pipe(catchError((error) => this.publicservice.handleError(error)));
    }
  
    addStage(st: Stage) {
      return this.http.post<Stage>(`${ this.APIUrl }` + this.serviceRoute, st)
      .pipe(catchError((error) => this.publicservice.handleError(error)));
    }
  
    deleteStage(id: number) {
      return (this.http.delete(`${ this.APIUrl }` + this.serviceRoute + `?id=${id}`))
      .pipe(catchError((error) => this.publicservice.handleError(error)));
    }
    
    modifyStage(st: Stage) {
      return this.http.put<Stage>(`${ this.APIUrl }` + this.serviceRoute, st)
      .pipe(catchError((error) => this.publicservice.handleError(error)));
    }
}
