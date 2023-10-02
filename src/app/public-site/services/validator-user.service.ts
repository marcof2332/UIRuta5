import { User } from './../../Interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, catchError, empty, map, of, tap } from 'rxjs';
import { enviroments } from 'src/enviroments/enviroments';

@Injectable({
  providedIn: 'root'
})
export class ValidatorUserService {

  private APIUrl: string = enviroments.APIUrl;
  private serviceRoute = 'session';
  private user?: User;

  constructor(
    private http: HttpClient,
  ) { }

  public isValidField( form: FormGroup, field: string ) {
    return form.controls[field].errors && form.controls[field].touched;
  }

  public errorMessages = {
    required: 'Este campo es requerido.',
  };

  public getErrorMessage(form: FormGroup, field: string): string | null {
    const control = form.get(field);

    if (control) {
      const errors = control.errors;
      if (errors) {
        if (errors['required']) {
          return this.errorMessages.required;
        }
      }
    }
    return null;
  }

  loginEmployee( us: User ): Observable<User> {
    return this.http.post<User>(`${ this.APIUrl }` + this.serviceRoute + `/login`, us)
    .pipe(
      tap( user => this.user = user),
      tap( () => localStorage.removeItem('token')),
      tap( user => localStorage.setItem('token', user.token)),// Usar localStorage para recuperar datos en caso de cerrar la sesion actual.
    )
  }

  autenticationVerification(): Observable<boolean> {

    console.log('Chequeo el localstorage si existe el token');
    const token = localStorage.getItem('token');

      if( token != null && token != '' )
      {
        console.log('Si existe el token lo envio a la API para verificar.');
        const us: User = {
          user: '', name: '', password: '', role: '',
          token: token
        };

        return this.http.post<User>(`${ this.APIUrl }` + this.serviceRoute, us)
        .pipe(
        tap( user => sessionStorage.setItem('userData', JSON.stringify(user))), // Usar sessionStorage para la sesion actual.
        map( user => !!user), //retorno un true o un false, si el usuario existe, devolvemos un valor booleano con una doble negacion.
        catchError( err => of(false) )
        );
      }
      else
      {
        console.log('token not found');
        return of(false);
      }
  }
}
