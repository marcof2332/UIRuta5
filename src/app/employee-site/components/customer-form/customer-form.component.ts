import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

import { CitiesService } from '../../services/cities.service';
import { ValidatorsService } from '../../services/validators.service';
import { ZoneService } from '../../services/zone.service';

import { City } from 'src/app/Interfaces/cities.interface';
import { Zone } from 'src/app/Interfaces/zone.interface';


@Component({
  selector: 'app-customer-form',
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css']
})
export class CustomerFormComponent {

  @Input() myForm!: FormGroup; //Validadores del formulario
  @Output() formSubmit: EventEmitter<void> = new EventEmitter<void>(); //Evento submit del formulario

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<CustomerFormComponent>,
    private validatorsService: ValidatorsService,
    private CitiesService: CitiesService,
    private ZonesService: ZoneService
  ) {}

  //Form
  @Input() statesValueList : number[] = [];
  @Input() statesLabelList : string[] = [];

  citiesList      : City[]   = [];
  zonesList       : Zone[]   = [];
  citiesValueList : number[] = [];
  citiesLabelList : string[] = [];
  zonesValueList  : number[] = [];
  zonesLabelList  : string[] = [];

  async ngOnInit() {
    this.myForm = this.data.form;
    this.statesLabelList = this.data.statesLabelList;
    this.statesValueList = this.data.statesValueList;
    await this.getCities()
    await this.getZones()
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

  clearFormFields() {
    this.markFieldsAsUntouched(this.myForm); // Marcar todos los campos como no tocados
    this.myForm.reset(); // Borrar los valores de todos los campos
  }

  onNoClick(): void {
    this.clearFormFields();
    this.dialogRef.close(false);
  }

  async getCities() {
    try {
      const result = await this.CitiesService.listCities().toPromise();

      if (result) {
        this.citiesList = result;
      } else {
        console.error('Ocurrio un error al buscar las ciudades.');
      }
    } catch (error) {
      console.error('Error al obtener las ciudades:', error);
    }
  }

  async getZones() {
    try {
      const result = await this.ZonesService.listZone().toPromise();

      if (result) {
        this.zonesList = result;
      } else {
        console.error('Ocurrio un error al buscar las zonas.');
      }
    } catch (error) {
      console.error('Error al obtener las zonas:', error);
    }
  }

  async loadCities(selectedState: number) {
    console.log('test')
    const citiesForSelectedState = this.citiesList.filter(city => city.CityState === selectedState);

    // Verifica si se encontraron ciudades para el estado
    if (citiesForSelectedState) {
      this.citiesValueList = citiesForSelectedState.map(city => city.IdCity);
      this.citiesLabelList = citiesForSelectedState.map(city => city.CityName);
    } else {
      // Si no se encontraron ciudades para el estado, puedes mostrar un mensaje o tomar otra acción apropiada.
      console.log('No se encontraron ciudades para el estado seleccionado.');
    }

    this.data.form.get('ClientCity').enable();
    this.data.form.get('ClientZone').disable();
  }

  async loadZones(selectedCity: number) {
    const ZonesForSelectedCity = this.zonesList.filter(zone => zone.City === selectedCity);

    // Verifica si se encontraron ciudades para el estado
    if (ZonesForSelectedCity) {
      this.zonesValueList = ZonesForSelectedCity.map(zone => zone.IdZone);
      this.zonesLabelList = ZonesForSelectedCity.map(zone => zone.ZoneName);

      this.data.form.get('ClientZone').enable();
    } else {
      // Si no se encontraron ciudades para el estado, puedes mostrar un mensaje o tomar otra acción apropiada.
      console.log('No se encontraron zonas para la ciudad seleccionada.');
    }
  }

  handleSubmit(): void {
    if (this.myForm.valid) {
      const formValues = this.myForm.value;
      this.formSubmit.emit(formValues); // Emitir el evento formSubmit al componente padre
      this.clearFormFields();
    }
}
}
