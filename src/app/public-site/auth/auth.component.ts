import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { User } from 'src/app/Interfaces/user.interface';
import { ValidatorUserService } from '../services/validator-user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { map, tap } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css']
})
export class AuthComponent {

  public isLoading: boolean = false;
  private user?: User;

 constructor(
    public dialogRef: MatDialogRef<AuthComponent>,
    @Inject(MAT_DIALOG_DATA) public data: User,
    private fb: FormBuilder, //importo un servicio para que me ayude a crear dinamicamente la form.
    private validatorsService: ValidatorUserService,
    private snackBar: MatSnackBar,  //me permite utilizar snackbars
    private router: Router,
  ) {}

    public myForm: FormGroup = this.fb.group({
      // las 3 partes de esta validacion es '' = valor inicial, [] = validador sincronos y [] = validadores asincronos o sea name: ['', [], []]
      user: ['', [Validators.required, Validators.maxLength(20) ]],
      password: ['', [Validators.required, Validators.maxLength(8) ]],
    });
    get currentUser(): User {
      const us = this.myForm.value as User;
      return us;
    }
    //Metodo que Verifica si el campo es valido
    isValidField( field: string) {
      return this.validatorsService.isValidField(this.myForm, field);
    }
    //Metodo que me permite mostrar el mensaje del validador debajo del input
    getErrorMessage(field: string): string | null {
      return this.validatorsService.getErrorMessage(this.myForm, field);
    }
    //Metodo para mostrar un snackbar con un mensaje
    showSnackBar( message: string ): void {
      this.snackBar.open( message, 'cerrar', {
        duration: 4000,
      })
    }

    onSubmit(): void {

      if( this.myForm.invalid ) return;
      console.log('Antes de ejecutar el logueo');
      this.isLoading = true;

      this.validatorsService.loginEmployee( this.currentUser )
      .subscribe( response => {
          console.log('Luego de ejecutar el metodo');
          //Si se loguea satisfactoriamente
          this.dialogRef.close(true);
          this.isLoading = false;
          this.router.navigate(['/employee-site']); // Redirigir al emp-site
          console.log(response);
        },
        error => {
           if (error instanceof HttpErrorResponse) {
            this.showSnackBar(`Ocurrio un error al intentar loguear al usuario.`);
            console.error('Server-side error message:', error.error.Message);
            console.error('Status-code:', error.error.status);
            this.isLoading = false;
            this.dialogRef.close(false);
          }
        }
      );
    }

    onNoClick(): void {
      this.dialogRef.close(false);
    }
}
