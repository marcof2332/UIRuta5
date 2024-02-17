import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormsModule, FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatStepper, StepperOrientation } from '@angular/material/stepper';
import { Observable, map } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatSelect } from '@angular/material/select';
import { ShippmentStagesComponent } from 'src/app/employee-site/pages/shippment/shippment-order/shippment-stages/shippment-stages.component';

import { ValidatorsService } from 'src/app/employee-site/services/validators.service';
import { StateService } from 'src/app/employee-site/services/state.service';
import { CitiesService } from 'src/app/employee-site/services/cities.service';
import { ZoneService } from 'src/app/employee-site/services/zone.service';
import { SharedmapdataService } from 'src/app/employee-site/services/sharedmapdata.service';

import { City } from 'src/app/Interfaces/cities.interface';
import { Zone } from 'src/app/Interfaces/zone.interface';
import { State } from 'src/app/Interfaces/state.interface';
import { ShippmentList } from '../../../../Interfaces/list-shippment.interface';
import { HomePickupsService } from 'src/app/employee-site/services/home-pickups.service';
import { HomePickup } from 'src/app/Interfaces/home-pickup.interface';
import { Shippment } from 'src/app/Interfaces/shippment.interface';
import { Customer } from 'src/app/Interfaces/customers.interface';
import { CustomerService } from 'src/app/employee-site/services/customer.service';
import { Package } from 'src/app/Interfaces/package.interface';
import { PackagesService } from 'src/app/employee-site/services/packages.service';
import { ShippmentService } from 'src/app/employee-site/services/shippment.service';
import { ShippmentStage } from 'src/app/Interfaces/shippment-stage.interface';
import { ValidatorUserService } from 'src/app/public-site/services/validator-user.service';
import { BranchOfficeService } from 'src/app/employee-site/services/branch-office.service';
import { BranchOffice } from 'src/app/Interfaces/branch-office.interface';
import { DropOff } from 'src/app/Interfaces/drop-off.interface';
import { DropoffService } from 'src/app/employee-site/services/dropoff.service';


@Component({
  selector: 'shpp-mng',
  templateUrl: './shippment-order.component.html',
  styleUrls: ['./shippment-order.component.css'],
})
export class ShippmentOrderComponent implements OnInit {

  stepperOrientation: Observable<StepperOrientation>;
  type: string = 'retiroDomicilio';

  Cities: City[] = [];
  Zones: Zone[] = [];
  stateList: State[] = [];
  Offices: BranchOffice[] = [];

  //#Select
  @ViewChild('stateselect') stateselect!: MatSelect;
  @ViewChild(MatStepper) stepper: MatStepper;
  
  ShippmentCityZones: Zone[] = [];
  PickUpCityZones: Zone[] = [];
  citiesValueList: number[] = [];
  citiesLabelList: string[] = [];
  statesValueList: number[] = [];
  statesLabelList: string[] = [];
  customers: Customer[] = [];
  addressTextBoxValue: string = "";

  PickUpCitySelectEnabled: boolean = false;
  PickUpZoneSelectEnabled: boolean = false;
  ShippmentCitySelectEnabled: boolean = false;
  ShippmentZoneSelectEnabled: boolean = false;
 

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
  shippment?            : ShippmentList;
  selectedPackages      : Package[];
  shippmentId           : number;
  newShippmentInstance  : Shippment;
  newHomePickup         : HomePickup;
  newDropOff            : DropOff;
  loggedUser            : number;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private breakpointObserver: BreakpointObserver,
    private validatorsService: ValidatorsService,
    private citiesService: CitiesService,
    private stateService: StateService,
    private zServ: ZoneService,
    private mapService: SharedmapdataService,
    private homePickupService: HomePickupsService,
    private dropOffService: DropoffService,
    private customerService: CustomerService,
    private packageService: PackagesService,
    private shippmentService: ShippmentService,
    private validatorUserService: ValidatorUserService,
    private officeService: BranchOfficeService,
  ) {
    this.stepperOrientation = breakpointObserver
      .observe('(min-width: 800px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));

  }

  async ngOnInit() {
    await this.getOffices();
    await this.getStates();
    await this.getCities();
    await this.getZones();
    await this.getUser();
    this.getCustomers();
  }

  //Crea el formulario con los campos necesarios
  myForm: FormGroup = this.fb.group({
    deliveryType: ['', Validators.required],

    retiroDomicilio: this.fb.group({
      StartTime: [''],
      EndTime: [''],
      Note: [''],
      TargetAddress: ['', [Validators.required, Validators.pattern(this.validatorsService.addressPattern)]],
      PickupAddress: ['', [Validators.required, Validators.pattern(this.validatorsService.addressPattern)]],
      PickUpCity: new FormControl({value: '', disabled: true}),
      PickupZone: new FormControl({value: '', disabled: true}, Validators.required),
      Sender: ['', Validators.required],
      Recipient: ['', Validators.required],
      RecipientCel: ['', Validators.required],
      TargetCity: new FormControl({value: '', disabled: true }),
      TargetZone: new FormControl({value: '', disabled: true,}, Validators.required),
      TargetLocation: ['']
    }),

    envioVentanilla: this.fb.group({
      BranchOffice: ['', Validators.required],
      Note: [''],
      ReceiptDate: [''],
      Sender: ['', Validators.required],
      Recipient: ['', Validators.required],
      RecipientCel: ['', Validators.required],
      TargetCity: new FormControl({value: '', disabled: true}),
      TargetZone: new FormControl({value: '', disabled: true}),
      TargetAddress: ['', Validators.required],
      TargetLocation: ['']
    }),

  });

  //Metodo para mostrar un snackbar con un mensaje
  showSnackBar(message: string): void {
    this.snackBar.open(message, 'cerrar', {
      duration: 4000,
    })
  }

  // Método que se ejecutará cuando cambie la selección
  onRadioChange(event: any) {
    this.type = event.value;
  }

  getFormGroup() {

    switch (this.type) {
      case "retiroDomicilio":
        return this.myForm.get('retiroDomicilio') as FormGroup;
      case "envioVentanilla":
        return this.myForm.get('envioVentanilla') as FormGroup;
      default:
        return this.myForm;
    }
  }

  async getOffices() {
    const result = await this.officeService.listOffices().toPromise();
    if (result) {
      this.Offices = result;
    } else {
      this.showSnackBar('Error al obtener las oficinas');
    }
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
      this.PickUpZoneSelectEnabled = false;
      this.retirementZoneMapEnabled = false;
      this.shipmentZoneMapEnabled = false;
    }
  }

  async loadCitiesPickUp(selectedState: number) {
    if (this.Cities) {
      const c = this.Cities.filter(city => city.CityState == selectedState);
      this.citiesValueList = c.map(c => c.IdCity);
      this.citiesLabelList = c.map(c => c.CityName);
      this.PickUpCityZones = [];
      this.retirementZoneMapEnabled = false;

      const PickUpCityControl = this.myForm.get('retiroDomicilio.PickUpCity');
      PickUpCityControl?.enable();
      const PickUpZoneControl = this.myForm.get('retiroDomicilio.PickupZone');
      PickUpZoneControl?.disable();
    } else {
      this.showSnackBar('No se encontraron ciudades para el estado seleccionado.');
    }
  }

  async loadZonesPickUp(selectedCity: number) {

    const TargetZoneControl = this.myForm.get('retiroDomicilio.PickupZone');
    TargetZoneControl?.enable();

    console.log(this.Zones)
    const z = this.Zones.filter(zo => zo.City == selectedCity);
    if(z)
      this.PickUpCityZones = z;
      else 
        this.showSnackBar('No se encontraron zonas para la ciudad seleccionada.');
  }

  async loadCitiesShippment(selectedState: number) {
    if (this.Cities) {
      const c = this.Cities.filter(city => city.CityState == selectedState);
      this.citiesValueList = c.map(c => c.IdCity);
      this.citiesLabelList = c.map(c => c.CityName);
      this.ShippmentCityZones = [];
      this.shipmentZoneMapEnabled = false;
      if(this.type == 'retiroDomicilio') {
        const targetCityControl = this.myForm.get('retiroDomicilio.TargetCity');
        targetCityControl?.enable();
        const TargetZoneControl = this.myForm.get('retiroDomicilio.TargetZone');
        TargetZoneControl?.disable();
      }
      else if(this.type == 'envioVentanilla') {
        const targetCityControl = this.myForm.get('envioVentanilla.TargetCity');
        targetCityControl?.enable();
        const TargetZoneControl = this.myForm.get('envioVentanilla.TargetZone');
        TargetZoneControl?.disable();
      }
    } else {
      this.showSnackBar('No se encontraron ciudades para el estado seleccionado.');
    }
  }

  async loadZonesShippment(selectedCity: number) {

    if(this.type == 'retiroDomicilio') {
        const TargetZoneControl = this.myForm.get('retiroDomicilio.TargetZone');
        TargetZoneControl?.enable();
      }
      else if(this.type == 'envioVentanilla') {
        const TargetZoneControl = this.myForm.get('envioVentanilla.TargetZone');
        TargetZoneControl?.enable();
      }
    const z = this.Zones.filter(zo => zo.City == selectedCity);
    if(z)
      this.ShippmentCityZones = z;
      else 
        this.showSnackBar('No se encontraron zonas para la ciudad seleccionada.');
  }

  getCustomers() {
    this.customerService.listCustomer().subscribe(list => {
      this.customers = list
    });
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
        if (this.shipmentZonePolygonPoints)
          this.shipmentZoneCenter = this.mapService.calculateCenter(this.shipmentZonePolygonPoints);
      } else
        this.showSnackBar("Ocurrio un error con la zona seleccionada, por favor seleccione otra.")
    }

  }

  addMarker(event: google.maps.PolyMouseEvent, zoneType: number) {
    if (event.latLng != null) {
      if (zoneType === 0) {
        //Zona retiro
        this.retirementZoneMarkerPosition = event.latLng;

        // Verifica si el marcador está dentro de la zona seleccionada
        const isInsideZone = this.isMarkerInsideZone(this.retirementZoneMarkerPosition, zoneType);

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

        // Verifica si el marcador está dentro de la zona seleccionada
        const isInsideZone = this.isMarkerInsideZone(this.shipmentZoneMarkerPosition, zoneType);

        if (isInsideZone == false) {
          this.showSnackBar('El marcador está fuera de la zona seleccionada.');
          this.shipmentZoneMarkerPosition = new google.maps.LatLng({} as google.maps.LatLngLiteral);
        }
        else {
          this.shipmentZoneMarkerPosition = event.latLng;
          console.log(this.shipmentZoneMarkerPosition.lng());
          //this.getAddressFromCoordinates(this.shipmentZoneMarkerPosition.lat(), this.shipmentZoneMarkerPosition.lng())
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
    return this.validatorsService.getErrorMessage(this.getFormGroup(), field);
  }

  clearSelects() {
    this.stateselect.value = null;
    this.citiesValueList = [];
    this.citiesLabelList = [];
    this.ShippmentCityZones = [];
    this.PickUpCityZones = [];
    this.PickUpCitySelectEnabled = false;
    this.PickUpZoneSelectEnabled = false;
    this.ShippmentCitySelectEnabled = false;
    this.ShippmentZoneSelectEnabled = false;
  }

  resetForm() {
    if (this.type === 'retiroDomicilio') {
      //reiniciar el stepper
      this.stepper.reset();
      this.stepper.selectedIndex = 0;
      // ... restablecer valores iniciales para el caso 'envioVentanilla'
      this.myForm.reset();
      this.myForm.clearAsyncValidators();
      this.myForm.clearValidators();
      this.myForm.markAsUntouched;
      this.shipmentZoneMapEnabled = false;
      this.retirementZoneMapEnabled = false;
      this.retirementZonePolygonPoints = [];
      this.retirementZoneMarkerPositions = [];
      this.retirementZoneMarkerPosition = new google.maps.LatLng({} as google.maps.LatLngLiteral);
      this.shipmentZoneMarkerPosition = new google.maps.LatLng({} as google.maps.LatLngLiteral);
      this.shipmentZoneMarkerPositions = [];
      this.shipmentZonePolygonPoints = [];
      this.selectedPackages = [];
      this.loadStates();
      this.clearSelects();
    } else if (this.type === 'envioVentanilla') {
      //reiniciar el stepper
      this.stepper.reset();
      this.stepper.selectedIndex = 0;
      // ... restablecer valores iniciales para el caso 'envioVentanilla'
      this.myForm.reset();
      this.myForm.clearAsyncValidators();
      this.myForm.clearValidators();
      this.myForm.markAsUntouched;
      this.shipmentZoneMapEnabled = false;
      this.shipmentZoneMarkerPosition = new google.maps.LatLng({} as google.maps.LatLngLiteral);
      this.shipmentZoneMarkerPositions = [];
      this.shipmentZonePolygonPoints = [];
      this.loadStates();
      this.clearSelects();
    }
  }

  firstSubmit() {
    this.type = 'datosEnvio'
  }

  saveHomePickup(): void {
    const form = this.getFormGroup();
    this.newShippmentInstance = {
      ReceiptDate: new Date(),
      Sender: form.get('Sender')?.value,
      Recipient: form.get('Recipient')?.value,
      RecipientCel: form.get('RecipientCel')?.value,
      TargetZone: this.shipmentZoneSelectedZone.IdZone,
      TargetAddress: form.get('TargetAddress')?.value,
      Latitude: this.shipmentZoneMarkerPosition.lat(),
      Longitude: this.shipmentZoneMarkerPosition.lng()
    };
    this.newHomePickup = {
      StartTime: form.get('StartTime')?.value,
      EndTime: form.get('EndTime')?.value,
      Note: form.get('Note')?.value,
      PickupAddress: form.get('PickupAddress')?.value, 
      PickUpZone: this.retirementZoneSelectedZone.IdZone,
      Latitude: this.retirementZoneMarkerPosition.lat(),
      Longitude: this.retirementZoneMarkerPosition.lng(),
      Shippments: this.newShippmentInstance
    };

    this.stepper.next();
  }

  saveDropOff(): void {
    const form = this.getFormGroup();
    this.newShippmentInstance = {
      ReceiptDate: new Date(),
      Sender: form.get('Sender')?.value,
      Recipient: form.get('Recipient')?.value,
      RecipientCel: form.get('RecipientCel')?.value,
      TargetZone: this.shipmentZoneSelectedZone.IdZone,
      TargetAddress: form.get('TargetAddress')?.value,
      Latitude: this.shipmentZoneMarkerPosition.lat(),
      Longitude: this.shipmentZoneMarkerPosition.lng()
    };
    this.newDropOff = {
      Note: form.get('Note')?.value,
      BranchOffice: form.get('BranchOffice')?.value,
      Shippments: this.newShippmentInstance
    };

    this.stepper.next();
  }

  handleSelectedPackages(selectedPackages: Package[]) {
      this.selectedPackages = selectedPackages;
  }

  newHomePickupRegister() {
    if(this.selectedPackages != undefined)
    {
      this.homePickupService.addHomePickup( this.newHomePickup ).subscribe(
        (response) => {
          this.shippmentId = response;
          this.selectedPackages.forEach(element => {
            element.Shippment = this.shippmentId;
          });
          this.newPackageRegister();
      }, (error) => {
        console.log("Error", error);
        this.showSnackBar(`No se pudo generar el envio`);
      });
    }
    else {
      this.showSnackBar(`Se debe elegir al menos un paquete`);
    }
  }
  
  newDropOffRegister() {
    console.log(this.selectedPackages)
    if(this.selectedPackages != undefined)
    {
      this.dropOffService.addDropOff( this.newDropOff ).subscribe(
        (response) => {
          this.shippmentId = response;
          this.selectedPackages.forEach(element => {
            element.Shippment = this.shippmentId;
          });
          this.newPackageRegister();
      }, (error) => {
        console.log("Error", error);
        this.showSnackBar(`No se pudo generar el envio`);
      });
    }
    else {
      this.showSnackBar(`Se debe elegir al menos un paquete`);
    }
  }

  newPackageRegister() {
    this.packageService.addManyPackages(this.selectedPackages).subscribe(
        (response) => {
          console.log("test 1 newPackageRegister")
          this.newShippmentStageRegister();
        },
        (error) => {
          this.showSnackBar('No se pudo registrar los paquetes.');
        }
      );
  }

  async getUser() {
    var us;
    const sub = this.validatorUserService.getUser().subscribe(
      (response) => {
        this.loggedUser = response;
      }
    );
  }

  newShippmentStageRegister() {
    const newShippmentStage: ShippmentStage = {
      IdShippment: this.shippmentId,
      IdSStage: 1, //Por defecto siempre ingresa en estado 1-Ingresado
      EmpID: this.loggedUser,
      DateTimeStage: new Date()
    }
    console.log(newShippmentStage)
    this.shippmentService.addShippmentStages(newShippmentStage).subscribe(
      (response) => {
        this.stepper.next();
      }, (error) => {
        this.showSnackBar('No se pudo registrar los paquetes.');
      });
    
  }

  // getAddressFromCoordinates(latitude: number, longitude: number): void {
  //   const geocoder = new google.maps.Geocoder();

  //   geocoder.geocode({ 'location': { lat: latitude, lng: longitude } }, (results, status) => {
  //     if (status === 'OK') {
  //       if (results != null && results[0]) {
  //         this.ngZone.run(() => {
  //           // Actualizar el valor del cuadro de texto con la dirección
  //           this.addressTextBoxValue = results[0].formatted_address;
  //           console.log(this.addressTextBoxValue);
  //         });
  //       }
  //     }
  //   });}


}
