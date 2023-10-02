import { Injectable } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsService {

  constructor() { }

  public isValidField( form: FormGroup, field: string ) {
    return form.controls[field].errors && form.controls[field].touched;
  }

  //Validadores
  public empIdPattern: string= "^[0-9]{7,8}$";
  public licencePattern: string = "^[A-Z]$|^[A-Z][0-9]$";
  public capacityPattern: string = "^[0-9]+$";
  public codePattern: string = "^[A-Z]{3}$";
  public datePattern: string = "\d{2}/\d{2}/\d{4}";
  public celPattern: string = "^[0-9]{9}$";

  public errorMessages = {
    required:'Este campo es requerido.',
    categoryPattern:'Ingrese solo una letra mayuscula o mayuscula seguida de un numero.',
    capacityPattern:'Este campo debe estar compuesto por numeros.',
    codePattern:'Este campo consta de tres letras mayusculas.',
    empIdPattern: 'La cedula de un empleado debe contener entre 7 y 8 caracteres.',
    celPattern: 'El nro. de celular debe contener 9 digitos.'
  };

  public getErrorMessage(form: FormGroup, field: string): string | null {
    const control = form.get(field);

    if (control) {
      const errors = control.errors;
      if (errors) {
        if (errors['required']) {
          return this.errorMessages.required;
        } else if (errors['pattern'] && field ==='category') {
          return this.errorMessages.categoryPattern;
        } else if (errors['pattern'] && field ==='capacity') {
          return this.errorMessages.capacityPattern;
        } else if (errors['pattern'] && field ==='code') {
          return this.errorMessages.codePattern;
        } else if (errors['pattern'] && field ==='ID') {
          return this.errorMessages.empIdPattern;
        } else if (errors['pattern'] && field ==='Celphone') {
          return this.errorMessages.celPattern;
        }
      }
    }

    return null;
  }

}
