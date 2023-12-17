import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormControl, FormGroup } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ValidatorsService } from '../../services/validators.service';

import { State } from 'src/app/Interfaces/state.interface';
import { City } from 'src/app/Interfaces/cities.interface';
import { Zone } from 'src/app/Interfaces/zone.interface';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SharedmapdataService } from '../../services/sharedmapdata.service';


@Component({
  selector: 'app-office-form',
  templateUrl: './office-form.component.html',
  styleUrls: ['./office-form.component.css']
})
export class OfficeFormComponent implements OnInit {

  @Input() myForm!: FormGroup; //Validadores del formulario
  @Input() states!: State[]; //Validadores del formulario
  @Input() cities!: City[]; //Validadores del formulario
  @Input() zones!: Zone[]; //Validadores del formulario
  @Output() formSubmit: EventEmitter<void> = new EventEmitter<void>(); //Evento submit del formulario

  //Selects
  selectedzoneId: number | null = null; // Variable para el estado seleccionado
  selectedstateId: number | null = null; // Variable para el estado seleccionado
  zonesValueList:  number[] = [];
  zonesLabelList:  string[] = [];
  citiesValueList:  number[] = [];
  citiesLabelList:  string[] = [];
  statesValueList:  number[] = [];
  statesLabelList:  string[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<OfficeFormComponent>,
    private validatorsService: ValidatorsService,
    private snackBar: MatSnackBar,
    private mapService: SharedmapdataService,
    private cd: ChangeDetectorRef // Necesario para detectar cambios después de deshabilitar controles
  ) {}

   //#Mapa
   center = { lat: -34.63999627181617, lng: -56.06497850140106 };
   zoom = 12;
   //markerPosition: google.maps.LatLngLiteral = {} as google.maps.LatLngLiteral;
   markerPosition: google.maps.LatLng = new google.maps.LatLng({} as google.maps.LatLngLiteral);
   mapEnabled: boolean = false;

   zoneValue : number = 0;
   selectedZone? : Zone;

   async ngOnInit() {
    this.myForm = this.data.form;
    this.states = this.data.states;
    this.cities = this.data.cities;
    this.zones = this.data.zones;
    await this.loadStates();
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
  onNoClick(): void {
    this.clearFormFields();
    this.dialogRef.close(false);
  }
  handleSubmit(): void {
    if (this.myForm.valid && this.markerPosition) {
      const formValues = this.myForm.value;
      console.log("Marker antes de invertirlo: ", this.markerPosition)
      const markerInverted = {
        lat: this.markerPosition.lng(),
        lng: this.markerPosition.lat(),
      };
      formValues.MarkerLocation = markerInverted;

      console.log("formValues: ",formValues);
      this.formSubmit.emit(formValues); // Emitir el evento formSubmit al componente padre
      this.clearFormFields();
    }
  }
  //Mapa
  onZoneSelectionChange(event: MatSelectChange): void {
    this.mapEnabled = true;
    this.selectedZone = this.zones.find(zone => zone.IdZone === event.value);
    if(this.selectedZone) {
      const coordinates = this.mapService.convertToLatLangLiteral(this.selectedZone);
      if(coordinates)
        this.center = this.mapService.calculateCenter(coordinates);
    } else
      this.showSnackBar("Ocurrio un error con la zona seleccionada, por favor seleccione otra.")
  }
 addMarker(event: google.maps.MapMouseEvent) {
    if(event.latLng != null) {
      this.markerPosition = event.latLng;
      console.log(this.markerPosition)

      // Verifica si el marcador está dentro de la zona seleccionada
      const isInsideZone = this.isMarkerInsideZone(this.markerPosition);
      console.log(isInsideZone)

      if (isInsideZone == false) {
        this.showSnackBar('El marcador está fuera de la zona seleccionada.');
        this.markerPosition = new google.maps.LatLng({} as google.maps.LatLngLiteral);
      }
      else {
        this.markerPosition = event.latLng;
        this.showSnackBar('Marcador agregado.');
      }
    }
    else
    { this.showSnackBar('Ocurrio un error al agregar el marker.') }
  }

  // Función para verificar si un marker está dentro del polígono de la zona
  isMarkerInsideZone(markerPosition: google.maps.LatLng): boolean {

    if (this.selectedZone && this.selectedZone.ZoneShape && this.selectedZone.ZoneShape.Geography?.WellKnownText) {
      const coordinates = this.mapService.convertToLatLangLiteral(this.selectedZone);
      const zonePolygon = new google.maps.Polygon({ paths: coordinates });
      // Utiliza la función containsLocation para verificar si el marker está dentro del polígono
      const isInside = google.maps.geometry.poly.containsLocation(
        //new google.maps.LatLng(markerPosition.lat, markerPosition.lng),
        markerPosition,
        zonePolygon
      );
      return isInside;
    }
    else
    return false;
  }

  async loadStates() {
    if(this.states) {
      this.statesValueList = this.states.map((state) => state.IdState);
      this.statesLabelList = this.states.map((state) => state.StateName);
    }
  }
  async loadCities(selectedState: number) {
    const citiesForSelectedState = this.cities.filter(city => city.CityState === selectedState);

    // Verifica si se encontraron ciudades para el estado
    if (citiesForSelectedState) {
      this.citiesValueList = citiesForSelectedState.map(city => city.IdCity);
      this.citiesLabelList = citiesForSelectedState.map(city => city.CityName);
    } else {
      // Si no se encontraron ciudades para el estado, puedes mostrar un mensaje o tomar otra acción apropiada.
      this.showSnackBar('No se encontraron ciudades para el estado seleccionado.');
    }

    this.data.form.get('OfficeCity').enable();
    this.data.form.get('Zone').disable();
  }
  async loadZones(selectedCity: number) {
    const ZonesForSelectedCity = this.zones.filter(zone => zone.City === selectedCity);

    // Verifica si se encontraron ciudades para el estado
    if (ZonesForSelectedCity) {
      this.zonesValueList = ZonesForSelectedCity.map(zone => zone.IdZone);
      this.zonesLabelList = ZonesForSelectedCity.map(zone => zone.ZoneName);

      this.data.form.get('Zone').enable();
    } else {
      // Si no se encontraron ciudades para el estado, puedes mostrar un mensaje o tomar otra acción apropiada.
      this.showSnackBar('No se encontraron zonas para la ciudad seleccionada.');
    }
  }
  //Metodo para mostrar un snackbar con un mensaje
  showSnackBar( message: string ): void {
      this.snackBar.open( message, 'cerrar', {
        duration: 4000,
      })
  }
  // Añade un método para deshabilitar los controles según sea necesario
  disableFormControls() {
    const officeStateControl = this.myForm.get('OfficeState');
    const officeCityControl = this.myForm.get('OfficeCity');
    const zoneControl = this.myForm.get('Zone');

    if (officeStateControl)
      officeStateControl.disable();
    if (officeCityControl)
      officeCityControl.disable();
    if (zoneControl)
      zoneControl.disable();

    this.cd.detectChanges();
  }
}

