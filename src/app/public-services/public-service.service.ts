import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';

@Injectable({providedIn: 'root'})

export class publicService {

  constructor(
    private router: Router
  ) { }

  public handleError(error: HttpErrorResponse): Observable<never> {
    if (error.status === 500)
    {console.log(error.error); return throwError('Error en el servidor. Comunicarse con soporte.' + error.error.Message)}
    else if (error.status === 400)
      { console.log(error.error); return throwError(error.error.Message);}
    else if (error.status === 401) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('userData');
      console.log(error.error);
      this.router.navigate(['/public-site']);
      return throwError(error.error.Message);
    }
    else if (error.status === 403) {
      localStorage.removeItem('token');
      sessionStorage.removeItem('userData');
      console.log(error.error);
      this.router.navigate(['/public-site']);
      return throwError(error.error.Message);
    }
    else (error.error.mensaje)
      return throwError('Error: ' + error.error);
  }

  handleSession()
  {
    localStorage.removeItem('token');
    sessionStorage.removeItem('userData');
  }
}
