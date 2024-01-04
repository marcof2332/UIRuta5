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
  public RUTPattern: string= "^[0-9]{12}$";
  public licencePattern: string = "^[A-Z]$|^[A-Z][0-9]$";
  public capacityPattern: string = "^[0-9]+$";
  public codePattern: string = "^[A-Z]{3}$";
  public addressPattern: string = "^[a-z]{3}$";
  public datePattern: string = "\d{2}/\d{2}/\d{4}";
  public celPattern: string = "^[0-9]{9}$";
  public phonePattern: string = "^[0-9]{8}$";
  public platePattern: string = "^[A-Z][A-Z][A-Z][0-9][0-9][0-9][0-9]$"

  public errorMessages = {
    required:'Este campo es requerido.',
    categoryPattern:'Ingrese solo una letra mayuscula o mayuscula seguida de un numero.',
    capacityPattern:'Este campo debe estar compuesto por numeros.',
    codePattern:'Este campo consta de tres letras mayusculas.',
    empIdPattern: 'La cedula de un empleado debe contener entre 7 y 8 caracteres.',
    celPattern: 'El nro. de celular debe contener 9 digitos.',
    phonePattern: 'El nro. de telefono debe contener 8 digitos.',
    platePattern: 'La patente debe estar compuesta por 3 letras y 4 numeros.',
    docRut: 'El campo debe contener 7 u 8 caracteres de ser una cedula o 12 de ser un RUT.',
    min0: 'El valor minimo es 0.',
    min3: 'El campo debe contener al menos 3 caracteres.',
    min2: 'El campo debe contener al menos 2 caracteres.',
    password: 'El campo debe contener 8 caracteres.',
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
        } else if (errors['pattern'] && field ==='Plate') {
          return this.errorMessages.platePattern;
        } else if (field ==='DocRut') {
          return this.errorMessages.docRut;
        } else if (errors['pattern'] && field ==='Phone') {
          return this.errorMessages.phonePattern;
        } else if (errors['pattern'] && field ==='PickupAddress') {
          return this.errorMessages.min3;
        } else if (field ==='EmpPassword') {
          return this.errorMessages.password;
        } else if (field ==='EmpUser') {
          return this.errorMessages.min3;
        } else if (field ==='EmpName') {
          return this.errorMessages.min2;
        } else if (field ==='EmpLastName') {
          return this.errorMessages.min2;
        } else if (field ==='EmpAddress') {
          return this.errorMessages.min3;
        } else if (field ==='BranchAddress') {
          return this.errorMessages.min3;
        } else if (field ==='TypeDescription') {
          return this.errorMessages.min3;
        } else if (field ==='MinWeight') {
          return this.errorMessages.min0;
        } else if (field ==='MaxWeight') {
          return this.errorMessages.min0;
        } else if (field ==='Amount') {
          return this.errorMessages.min0;
        } else if (field ==='CustomerName') {
          return this.errorMessages.min2;
        } else if (field ==='CLastName') {
          return this.errorMessages.min2;
        } else if (field ==='CliAddress') {
          return this.errorMessages.min2;
        }  
      }
    }
    return null;
  }

}
