import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ValidatorsService } from '../../services/validators.service';
import { AbstractControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-zone-form',
  templateUrl: './zone-form.component.html',
  styleUrls: ['./zone-form.component.css']
})
export class ZoneFormComponent {

  @Input() myForm!: FormGroup; //Validadores del formulario
  @Input() cityLabelList!: string[]; //Validadores del formulario
  @Input() cityValueList!: number[]; //Validadores del formulario
  @Output() formSubmit: EventEmitter<void> = new EventEmitter<void>(); //Evento submit del formulario

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<ZoneFormComponent>,
    private validatorsService: ValidatorsService,

  ) {}

  //#Mapa
  center = { lat: -34.63999627181617, lng: -56.06497850140106 };
  zoom = 12;
  markerOptions: google.maps.MarkerOptions = {draggable: false};
  markerPositions: google.maps.LatLngLiteral[] = [];
  polygonPoints: google.maps.LatLngLiteral[] = [];

  ngOnInit(): void {
    this.myForm = this.data.form;
    this.cityLabelList = this.data.cityLabelList;
    this.cityValueList = this.data.cityValueList;
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
  if (this.myForm.valid && this.polygonPoints.length > 2) {
    const formValues = this.myForm.value;

    const firstPoint = this.polygonPoints[0];
    this.polygonPoints.push(firstPoint);

    formValues.ZoneShape = this.polygonPoints;
    this.formSubmit.emit(formValues); // Emitir el evento formSubmit al componente padre
    this.clearFormFields();
  }
}
  //#region Mapa
  //Seleccionar marker para cerrar el poligono
  selectedMarkerIndex: number | null = null;

  addMarker(event: google.maps.MapMouseEvent) {
      if(event.latLng != null) {
        this.markerPositions.push(event.latLng.toJSON());
        this.polygonPoints = [...this.polygonPoints, event.latLng.toJSON()];
        console.log(this.polygonPoints)
      }
      else
      { console.log(console.error()) }

  }

  markerClick(markerIndex: number) {
    if (this.selectedMarkerIndex === markerIndex) {
      // Si se hace clic en el marcador seleccionado nuevamente, lo deseleccionamos.
      this.selectedMarkerIndex = null;
    } else {
      // Si se hace clic en un nuevo marcador, lo seleccionamos y cerramos el polígono.
      this.selectedMarkerIndex = markerIndex;

      // Agrega el primer punto al final del arreglo para cerrar el polígono.
      this.polygonPoints.push(this.polygonPoints[0]);
    }
  }

  removeLastMarker() {
    if (this.markerPositions.length > 0) {
      const lastMarkerIndex = this.markerPositions.length - 1;
      this.removeMarker(lastMarkerIndex);
    }
  }

  removeMarker(markerIndex: number) {
    if (markerIndex >= 0 && markerIndex < this.markerPositions.length) {
      this.markerPositions.splice(markerIndex, 1);
      this.polygonPoints = this.markerPositions.slice(); // Actualiza el polígono con las posiciones restantes.
      this.selectedMarkerIndex = null; // Deselecciona cualquier marcador seleccionado.
    }
  }

  clearPolygon() {
    this.polygonPoints = []; // Limpia el arreglo de puntos del polígono
    this.markerPositions = [];
  }
  //#endregion Mapa

}
