import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { SharedInput } from '../component-interfaces/shared-input.interface';
import {NgxMaterialTimepickerModule} from 'ngx-material-timepicker';

import { ValidatorsService } from '../../services/validators.service';


@Component({
  selector: 'app-shared-form',
  templateUrl: './shared-form.component.html',
  styleUrls: ['./shared-form.component.css'],
})
export class SharedFormComponent implements OnInit {

  @Input() myForm!: FormGroup; //Validadores del formulario
  @Input() formFields: SharedInput[] = []; //Almacenamiento de los campos del formulario
  @Output() formSubmit: EventEmitter<void> = new EventEmitter<void>(); //Evento submit del formulario

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<SharedFormComponent>,
    private validatorsService: ValidatorsService,
  ) {}

  //Maneja el evento de cambio de entrada de un campo de texto y actualiza el valor en mayúsculas.
  onInputChange(fieldName: string, event: Event) {
    const inputElement = event.target as HTMLInputElement;
    const uppercaseValue = inputElement.value.toUpperCase();
    this.myForm.get(fieldName)?.setValue(uppercaseValue, { emitEvent: false });
  }

  ngOnInit(): void {
    this.myForm = this.data.form;
    this.formFields = this.data.formFields;
  }

  //Metodo que Verifica si el campo es valido
  isValidField( field: string) {
    return this.validatorsService.isValidField(this.myForm, field);
  }

  //Metodo que me permite mostrar el mensaje del validador debajo del input
  getErrorMessage(field: string): string | null {
    return this.validatorsService.getErrorMessage(this.myForm, field);
  }

   // Método para marcar todos los campos como "untouched"
   public markFieldsAsUntouched(control: AbstractControl): void {
    if (control instanceof FormGroup) {
      Object.keys(control.controls).forEach((field) => {
        const controlField = control.get(field);
        if (controlField) {
          this.markFieldsAsUntouched(controlField);
        }
      });
    } else if (control instanceof AbstractControl) {
      control.markAsUntouched();
    }
  }

  clearFormFields(): void {
    this.markFieldsAsUntouched(this.myForm); // Marcar todos los campos como no tocados
    this.myForm.reset(); // Borrar los valores de todos los campos
  }

  // Método que se llama cuando se envía el formulario
  handleSubmit(): void {
    if (this.myForm.valid) {
      const formValues = this.myForm.value;
      console.log(formValues)
      this.formSubmit.emit(formValues); // Emitir el evento formSubmit al componente padre
      this.clearFormFields();
    }
}

  onNoClick(): void {
    this.clearFormFields();
    this.dialogRef.close(false);
  }
}
