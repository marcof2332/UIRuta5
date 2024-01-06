import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { StepperOrientation } from '@angular/material/stepper';
import { Observable, map } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSelect } from '@angular/material/select';

import { ValidatorsService } from 'src/app/employee-site/services/validators.service';
import { StateService } from 'src/app/employee-site/services/state.service';
import { CitiesService } from 'src/app/employee-site/services/cities.service';
import { ZoneService } from 'src/app/employee-site/services/zone.service';
import { SharedmapdataService } from 'src/app/employee-site/services/sharedmapdata.service';

import { City } from 'src/app/Interfaces/cities.interface';
import { Zone } from 'src/app/Interfaces/zone.interface';
import { State } from 'src/app/Interfaces/state.interface';
import { ShippmentList } from '../../../../Interfaces/list-shippment.interface';


@Component({
  selector: 'shpp-mng',
  templateUrl: './shippment-order.component.html',
  styleUrls: ['./shippment-order.component.css']
})
export class ShippmentOrderComponent implements OnInit {

  stepperOrientation: Observable<StepperOrientation>;
  type: string = 'retiroDomicilio';

  Cities: City[] = [];
  Zones: Zone[] = [];
  stateList: State[] = [];

  //#Select
  @ViewChild('stateselect') stateselect!: MatSelect;
  zonesValueList: number[] = [];
  zonesLabelList: string[] = [];
  citiesValueList: number[] = [];
  citiesLabelList: string[] = [];
  statesValueList: number[] = [];
  statesLabelList: string[] = [];

  departamentoSelectEnabled: boolean = true;
  ciudadSelectEnabled: boolean = false;
  zonaSelectEnabled: boolean = false;
  //

  //#Mapa
  // Variables para el mapa de Retiro a Domicilio
  retirementZoneCenter = { lat: -34.63999627181617, lng: -56.06497850140106 };
  retirementZoneZoom = 12;
  retirementZoneMarkerPosition: google.maps.LatLng = new google.maps.LatLng({} as google.maps.LatLngLiteral);
  retirementZoneMapEnabled: boolean = false;
  retirementZoneValue: number = 0;
  retirementZoneSelectedZone?: Zone;
  retirementZoneMarkerPositions: google.maps.LatLngLiteral[] = [];
  retirementZonePolygonPoints: google.maps.LatLngLiteral[] = [];
  retirementZonePolygonOptions: google.maps.PolygonOptions = {
    fillOpacity: 0,
    clickable: true,
  };

  // Variables para el mapa de Envío por Ventanilla
  shipmentZoneCenter = { lat: -34.63999627181617, lng: -56.06497850140106 };
  shipmentZoneZoom = 12;
  shipmentZoneMarkerPosition: google.maps.LatLng = new google.maps.LatLng({} as google.maps.LatLngLiteral);
  shipmentZoneMapEnabled: boolean = false;
  shipmentZoneValue: number = 0;
  shipmentZoneSelectedZone?: Zone;
  shipmentZoneMarkerPositions: google.maps.LatLngLiteral[] = [];
  shipmentZonePolygonPoints: google.maps.LatLngLiteral[] = [];
  shipmentZonePolygonOptions: google.maps.PolygonOptions = {
    fillOpacity: 0,
    clickable: true,
  };
  //
  //#Shippment
  shippment?: ShippmentList;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver,
    private validatorsService: ValidatorsService,
    private citiesService: CitiesService,
    private stateService: StateService,
    private zServ: ZoneService,
    private mapService: SharedmapdataService,
  ) {
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  }

  async ngOnInit() {
    await this.getStates();
    await this.getCities();
    await this.getZones();
  }

  //Crea el formulario con los campos necesarios
  myForm: FormGroup = this.fb.group({
    deliveryType: ['', Validators.required],

    retiroDomicilio: this.fb.group({
      StartTime: [''],
      EndTime: [''],
      Note: [''],
      PickupAddressShippingZone: ['', [Validators.required, Validators.pattern(this.validatorsService.addressPattern)]],
      PickupAddressRetirementArea: ['', [Validators.required, Validators.pattern(this.validatorsService.addressPattern)]],
      PickupZone: ['', Validators.required],
      Sender: ['', Validators.required],
      Recipient: ['', Validators.required],
      RecipientCel: ['', Validators.required],
      TargetZone: ['', Validators.required],
      TargetAddress: ['', Validators.required],
      TargetLocation: ['']
    }),

    envioVentanilla: this.fb.group({
      sucursal: ['', Validators.required]
    }),

    datosEnvio: this.fb.group({
      ReceiptDate: ['', Validators.required],
      Sender: ['', Validators.required],
      Recipient: ['', Validators.required],
      RecipientCel: ['', Validators.required],
      TargetZone: ['', Validators.required],
      TargetAddress: ['', Validators.required],
      TargetLocation: ['']
    }),
  });

  //Crea el formulario con los campos necesarios
  // myForm: FormGroup = this.fb.group({
  //   deliveryType: ['', Validators.required],
  // });

  // retiroDomicilio: FormGroup = this.fb.group({
  //     StartTime: [''],
  //     EndTime: [''],
  //     Note: [''],
  //     PickupAddress: ['',[ Validators.required, Validators.pattern(this.validatorsService.addressPattern)]],
  //     PickupZone: ['', Validators.required],
  //   });

  // envioVentanilla: FormGroup = this.fb.group({
  //     sucursal: ['', Validators.required]
  //   });

  // datosEnvio: FormGroup = this.fb.group({
  //     Sender: ['', [Validators.required, Validators.pattern(this.validatorsService.empIdPattern) || Validators.pattern(this.validatorsService.RUTPattern)  ]],
  //     Recipient: ['', [Validators.required, Validators.pattern(this.validatorsService.empIdPattern) || Validators.pattern(this.validatorsService.RUTPattern)  ]],
  //     RecipientCel: ['', Validators.required],
  //     TargetZone: ['', Validators.required],
  //     TargetAddress: ['', Validators.required],
  //     TargetLocation: ['']
  //   });


  //Metodo para mostrar un snackbar con un mensaje
  showSnackBar(message: string): void {
    this.snackBar.open(message, 'cerrar', {
      duration: 4000,
    })
  }

  // Método que se ejecutará cuando cambie la selección
  onRadioChange(event: any) {
    this.type = event.value;
    console.log(this.type);
  }

  getFormGroup() {

    switch (this.type) {
      case 'retiroDomicilio':
        return this.myForm.get('retiroDomicilio') as FormGroup;
      case 'envioVentanilla':
        return this.myForm.get('envioVentanilla') as FormGroup;
      case 'datosEnvio':
        return this.myForm.get('datosEnvio') as FormGroup;
      default:
        console.log('test')
        return this.myForm;
    }

    // switch (this.type) {
    //     case 'retiroDomicilio':
    //       return this.retiroDomicilio as FormGroup;
    //     case 'envioVentanilla':
    //       return this.envioVentanilla as FormGroup;
    //     case 'datosEnvio':
    //       console.log(this.datosEnvio)
    //       return this.datosEnvio as FormGroup;
    //     default:
    //       return this.myForm;
    //   }
  }

  async getStates() {
    const result = await this.stateService.listStates().toPromise();
    if (result) {
      this.stateList = result;
      this.loadStates();
    } else {
      this.showSnackBar('Error al obtener los departamentos');
    }
  }

  async getCities() {
    try {
      const result = await this.citiesService.listCities().toPromise();
      if (result) {
        this.Cities = result;
        console.log(this.Cities);
      } else {
        console.error('Ocurrio un error al buscar las ciudades.');
      }
    } catch (error) {
      this.showSnackBar('Error al obtener los ciudades');
    }
  }

  async getZones() {
    const result = await this.zServ.listZone().toPromise();
    if (result) {
      this.Zones = result;
    } else {
      console.error('Ocurrio un error al buscar las ciudades.');
    }
  }

  async loadStates() {
    if (this.stateList) {
      this.statesValueList = this.stateList.map((state) => state.IdState);
      this.statesLabelList = this.stateList.map((state) => state.StateName);
    }
  }

  async loadCities(selectedState: number) {

    //const state = this.stateList.find(state => state.IdState == selectedState);
    //if(state && this.Cities) {
    if (this.Cities) {
      const c = this.Cities.filter(city => city.CityState == selectedState);
      this.citiesValueList = c.map(c => c.IdCity);
      this.citiesLabelList = c.map(c => c.CityName);
      this.zonesValueList = [];
      this.zonesLabelList = [];
      console.log("Ciudades de estado", this.citiesValueList, this.citiesValueList)
    } else {
      this.showSnackBar('No se encontraron ciudades para el estado seleccionado.');
    }

    this.ciudadSelectEnabled = true;
    this.zonaSelectEnabled = false;
  }

  async loadZones(selectedCity: number) {

    const city = this.Cities.find(c => c.IdCity === selectedCity);
    if (city && city.Zones) {
      const zones = city.Zones.filter(zone => zone.City === selectedCity);
      if (zones) {
        this.zonesValueList = zones.map(zone => zone.IdZone);
        this.zonesLabelList = zones.map(zone => zone.ZoneName);
        this.zonaSelectEnabled = true;
      } else {
        this.showSnackBar('No se encontraron zonas para la ciudad seleccionada.');
      }
    }
  }

  // Función para verificar si un marker está dentro del polígono de la zona
  isMarkerInsideZone(markerPosition: google.maps.LatLng, zoneType: number): boolean {
    let isInside: boolean = false;
    if (zoneType === 0) {
      //Zona retiro 
      if (this.retirementZoneSelectedZone && this.retirementZoneSelectedZone?.ZoneShape && this.retirementZoneSelectedZone.ZoneShape.Geography?.WellKnownText) {
        const coordinates = this.mapService.convertToLatLangLiteral(this.retirementZoneSelectedZone);
        const zonePolygon = new google.maps.Polygon({ paths: coordinates });
        // Utiliza la función containsLocation para verificar si el marker está dentro del polígono
        isInside = google.maps.geometry.poly.containsLocation(
          //new google.maps.LatLng(markerPosition.lat, markerPosition.lng),
          markerPosition,
          zonePolygon
        );
      }
    }
    if (zoneType === 1) {
      if (this.shipmentZoneSelectedZone && this.shipmentZoneSelectedZone?.ZoneShape && this.shipmentZoneSelectedZone.ZoneShape.Geography?.WellKnownText) {
        const coordinates = this.mapService.convertToLatLangLiteral(this.shipmentZoneSelectedZone);
        const zonePolygon = new google.maps.Polygon({ paths: coordinates });
        // Utiliza la función containsLocation para verificar si el marker está dentro del polígono
        isInside = google.maps.geometry.poly.containsLocation(
          //new google.maps.LatLng(markerPosition.lat, markerPosition.lng),
          markerPosition,
          zonePolygon
        );
      }
    }
    
    return isInside;
  }

  //Mapa
  onSelectChange(event: any, zoneType: number): void {
    if (zoneType === 0) {
      //Zona retiro
      this.retirementZoneMapEnabled = true;
      this.retirementZoneSelectedZone = this.Zones.find(zone => zone.IdZone === event);
      if (this.retirementZoneSelectedZone) {
        this.retirementZonePolygonPoints = this.mapService.convertToLatLangLiteral(this.retirementZoneSelectedZone);
        console.log(this.retirementZonePolygonPoints);
        if (this.retirementZonePolygonPoints)
          this.retirementZoneCenter = this.mapService.calculateCenter(this.retirementZonePolygonPoints);
      } else
        this.showSnackBar("Ocurrio un error con la zona seleccionada, por favor seleccione otra.")
    }
    if (zoneType === 1) {
      //Zona envio
      this.shipmentZoneMapEnabled = true;
      this.shipmentZoneSelectedZone = this.Zones.find(zone => zone.IdZone === event);
      if (this.shipmentZoneSelectedZone) {
        this.shipmentZonePolygonPoints = this.mapService.convertToLatLangLiteral(this.shipmentZoneSelectedZone);
        console.log(this.shipmentZonePolygonPoints);
        if (this.shipmentZonePolygonPoints)
          this.shipmentZoneCenter = this.mapService.calculateCenter(this.shipmentZonePolygonPoints);
      } else
        this.showSnackBar("Ocurrio un error con la zona seleccionada, por favor seleccione otra.")
    }

  }

  addMarker(event: google.maps.PolyMouseEvent, zoneType: number) {
    console.log('Clic dentro del polígono:', event);
    if (event.latLng != null) {
      if (zoneType === 0) {
        //Zona retiro
        this.retirementZoneMarkerPosition = event.latLng;
        console.log(this.retirementZoneMarkerPosition)

        // Verifica si el marcador está dentro de la zona seleccionada
        const isInsideZone = this.isMarkerInsideZone(this.retirementZoneMarkerPosition, zoneType);
        console.log(isInsideZone)

        if (isInsideZone == false) {
          this.showSnackBar('El marcador está fuera de la zona seleccionada.');
          this.retirementZoneMarkerPosition = new google.maps.LatLng({} as google.maps.LatLngLiteral);
        }
        else {
          this.retirementZoneMarkerPosition = event.latLng;
          this.showSnackBar('Marcador agregado.');
        }
      }
      if (zoneType === 1) {
        //Zona envio
        this.shipmentZoneMarkerPosition = event.latLng;
        console.log(this.shipmentZoneMarkerPosition)

        // Verifica si el marcador está dentro de la zona seleccionada
        const isInsideZone = this.isMarkerInsideZone(this.shipmentZoneMarkerPosition, zoneType);
        console.log(isInsideZone)

        if (isInsideZone == false) {
          this.showSnackBar('El marcador está fuera de la zona seleccionada.');
          this.shipmentZoneMarkerPosition = new google.maps.LatLng({} as google.maps.LatLngLiteral);
        }
        else {
          this.shipmentZoneMarkerPosition = event.latLng;
          this.showSnackBar('Marcador agregado.');
        }
      }
    }
    else { this.showSnackBar('Ocurrio un error al agregar el marker.') }
  }

  //Metodo que Verifica si el campo es valido
  isValidField(field: string) {
    return this.validatorsService.isValidField(this.getFormGroup(), field);
  }

  //Metodo que me permite mostrar el mensaje del validador debajo del input
  getErrorMessage(field: string): string | null {
    console.log(this.getFormGroup())
    return this.validatorsService.getErrorMessage(this.getFormGroup(), field);
  }

  clearSelects() {
    this.stateselect.value = null;
    this.citiesValueList = [];
    this.citiesLabelList = [];
    this.zonesValueList = [];
    this.zonesLabelList = [];
    this.departamentoSelectEnabled = true;
    this.ciudadSelectEnabled = false;
    this.zonaSelectEnabled = false;
  }

  resetForm() {
    // Restablecer valores iniciales para los mat-select
    if (this.type === 'retiroDomicilio') {
      this.getFormGroup();
      this.myForm.reset();
      this.clearSelects();
      this.shipmentZoneMapEnabled = false;
      this.retirementZoneMapEnabled = false;
    } else if (this.type === 'envioVentanilla') {
      // ... restablecer valores iniciales para el caso 'envioVentanilla'
    }
  }

  firstSubmit() {
    this.type = 'datosEnvio'
  }


}
