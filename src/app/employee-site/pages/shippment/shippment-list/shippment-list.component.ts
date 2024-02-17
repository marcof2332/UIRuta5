import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup } from '@angular/forms';
//Shared components
import { TableColumn } from 'src/app/employee-site/components/component-interfaces/TableColumn.interface';
import { SharedTableComponent } from 'src/app/employee-site/components/shared-table/shared-table.component';
//Interfaces
import { Shippment } from 'src/app/Interfaces/shippment.interface';
import { City } from 'src/app/Interfaces/cities.interface';
import { Zone } from 'src/app/Interfaces/zone.interface';
import { State } from 'src/app/Interfaces/state.interface';
//Services
import { ZoneService } from 'src/app/employee-site/services/zone.service';
import { StateService } from 'src/app/employee-site/services/state.service';
import { CitiesService } from 'src/app/employee-site/services/cities.service';
import { ShippmentService } from 'src/app/employee-site/services/shippment.service';
import { ShippmentStage } from 'src/app/Interfaces/shippment-stage.interface';
import { ShippmentDetailsComponent } from 'src/app/employee-site/components/shippment-details/shippment-details.component';
import { DropoffService } from 'src/app/employee-site/services/dropoff.service';
import { HomePickupsService } from 'src/app/employee-site/services/home-pickups.service';

@Component({
  selector: 'shippment-list',
  templateUrl: './shippment-list.component.html',
  styleUrls: ['./shippment-list.component.css']
})

export class ShippmentListComponent implements OnInit {

  constructor(
    private zServ: ZoneService,
    private CitiesService: CitiesService,
    private StateService: StateService,
    private shippmentService: ShippmentService,
    private fb: FormBuilder, //importo un servicio para que me ayude a crear dinamicamente la form.
    private dialog: MatDialog, //Me permite crear un dialog, que voy a utilizar a la hora de eliminar
    private snackBar: MatSnackBar,
    private drpService: DropoffService,
    private hpService: HomePickupsService,
    ) { }

  //Table
  columns: TableColumn[] = [];
  dataSource: MatTableDataSource<ShippmentStage>= new MatTableDataSource(); //Datos originales

  @ViewChild(MatTable) table!: SharedTableComponent;
  resultsLength: number = 0;
  dataLoaded = false;
  isEmpty!: boolean;

  selectedzoneId:   number | null = null; // Variable para la zona seleccionada
  selectedstateId:  number | null = null; // Variable para el estado seleccionado
  zonesValueList:   number[] = [];
  zonesLabelList:   string[] = [];
  citiesValueList:  number[] = [];
  citiesLabelList:  string[] = [];
  statesValueList:  number[] = [];
  statesLabelList:  string[] = [];


  getTableColumns(): TableColumn[] {
    return [
      { header: 'Identificador', field: 'IdShippment', type: 'text' },
      { header: 'Etapa', field: 'StageDescription', type: 'text'  },
      { header: 'Emp. asociado', field: 'EmpID', type: 'text' },
      { header: 'Fecha', field: 'DateTimeStage', type: 'date' },
      { header: 'Vehiculo', field: 'Plate', type: 'text' },
      { header: 'Retiro en dom.', field: 'ShType', type: 'text' },
      { header: ' ', field: 'search', type: 'button', color: 'mat-primary', icon: 'search', action: (item) => this.openDialogDetails(item)},
    ];
  };

  //Metodo para mostrar un snackbar con un mensaje
  showSnackBar( message: string ): void {
    this.snackBar.open( message, 'cerrar', {
      duration: 4000,
    })
  };

  async refreshMethod() {

    this.shippmentService.listallShippmentStages().subscribe(
      (result) => {
        console.log(result);
        if (result != null) {
          result.forEach(element => {
            if(element.Vehicle != null)
              element.Plate = element.Vehicles.Plate;
            else
            element.Plate = 'n/a'
            element.StageDescription = element.Stages.StageDescription;
          });
          this.dataSource.data = result;
          this.columns = this.getTableColumns();
          this.resultsLength = result.length;
          this.dataLoaded = true;
          // // Testear
           this.isEmpty = this.dataSource.data.length === 0;
        } else {
          this.showSnackBar('Ocurrio un error al mostrar los pedidos.');
        }
      },
      (error) => {
        this.showSnackBar(error);
      }
    );
  };

  //Crea el formulario con los campos necesarios
  myForm: FormGroup = this.fb.group({

    retiroDomicilio: this.fb.group({
      IdHomePickup: [''],
      ReceiptDate: [''],
      Sender: [''],
      Recipient: [''],
      RecipientCel: [''],
      TargetZone: [''],
      TargetAddress: [''],
      TargetLocation: [''],
      StartTime: [''],
      EndTime: [''],
      Note: [''],
      PickupAddress: [''],
      PickUpZone: [''],
    }),

    envioVentanilla: this.fb.group({
      IdDropOff: [''],
      Note: [''],
      BranchOffice: [''],
      ReceiptDate: [''],
      Sender: [''],
      Recipient: [''],
      RecipientCel: [''],
      TargetZone: [''],
      TargetAddress: [''],
      TargetLocation: [''],
      sucursal: [''],
    }),

  });

  getFormGroup( type : boolean) {

    switch (type) {
      case true:
        return this.myForm.get('retiroDomicilio') as FormGroup;
      case false:
        return this.myForm.get('envioVentanilla') as FormGroup;
      default:
        return this.myForm;
    }
  }

  openDialogDetails(item: any) {

    if(item.ShType == true)
    {
      const hp = this.hpService.findHomePickup(item.IdShippment).subscribe((result) => {
        const dialogo1 = this.dialog.open(ShippmentDetailsComponent, { //Abro la instancia de el formulario creado con un Matdialog
          data: {
            form: this.getFormGroup(item.ShType), //Obtengo los validadores.
            item: item, // Pasa el objeto item como parte de los datos
            full: result
          },
          disableClose: true, //Desactivo que el formulario se pueda cerrar al presionar fuera.
        });

        dialogo1.afterOpened().subscribe(() => {

          const controlsToSet = [
            { controlName: 'StartTime', value: result.StartTime },
            { controlName: 'EndTime', value: result.EndTime },
            { controlName: 'Note', value: result.Note },
            { controlName: 'PickupAddress', value: result.PickupAddress },
            { controlName: 'PickUpZone', value: result.PickUpZone },
            { controlName: 'ReceiptDate', value: result.Shippments.ReceiptDate },
            { controlName: 'Sender', value: result.Shippments.Sender },
            { controlName: 'Recipient', value: result.Shippments.Recipient },
            { controlName: 'RecipientCel', value: result.Shippments.RecipientCel },
            { controlName: 'TargetZone', value: result.Shippments.TargetZone },
            { controlName: 'TargetAddress', value: result.Shippments.TargetAddress },
            { controlName: 'TargetLocation', value: result.Shippments.TargetLocation },
          ];
        
  
          controlsToSet.forEach((controlInfo) => {
            const control = dialogo1.componentInstance.myForm.get(controlInfo.controlName);
            if (control)
              control.setValue(controlInfo.value);
            });
          });

      });
    }
    else
    {
      this.drpService.findDropOff(item.IdShippment).subscribe((result) => {

      const dialogo1 = this.dialog.open(ShippmentDetailsComponent, { //Abro la instancia de el formulario creado con un Matdialog
        data: {
          form: this.getFormGroup(item.ShType), //Obtengo los validadores.
          item: item, // Pasa el objeto item como parte de los datos
          full: result
        },
        disableClose: true, //Desactivo que el formulario se pueda cerrar al presionar fuera.
      });

       dialogo1.afterOpened().subscribe(() => {

        const controlsToSet = [
          { controlName: 'BranchOffice', value: result.BranchOffice },
          { controlName: 'Note', value: result.Note },
          { controlName: 'ReceiptDate', value: result.Shippments.ReceiptDate },
          { controlName: 'Sender', value: result.Shippments.Sender },
          { controlName: 'Recipient', value: result.Shippments.Recipient },
          { controlName: 'RecipientCel', value: result.Shippments.RecipientCel },
          { controlName: 'TargetZone', value: result.Shippments.TargetZone },
          { controlName: 'TargetAddress', value: result.Shippments.TargetAddress },
          { controlName: 'TargetLocation', value: result.Shippments.TargetLocation },
        ];
      

        controlsToSet.forEach((controlInfo) => {
          const control = dialogo1.componentInstance.myForm.get(controlInfo.controlName);
          if (control)
            control.setValue(controlInfo.value);
          });
        });
      });
    }    
  }

  // async getStates() {
  //   const result = await this.StateService.listStates().toPromise();
  //   if (result) {
  //     this.stateList = result;
  //     this.statesValueList = result.map((state) => state.IdState);
  //     this.statesLabelList = result.map((state) => state.StateName);
  //   } else {
  //     this.showSnackBar('Error al obtener los departamentos');
  //   }
  // };

  // async getCities() {
  //   try {
  //     const result = await this.CitiesService.listCities().toPromise();

  //     if (result) {
  //       this.Cities = result;
  //     } else {
  //       console.error('Ocurrio un error al buscar las ciudades.');
  //     }
  //   } catch (error) {
  //     this.showSnackBar('Error al obtener los ciudades');
  //   }
  // };

  // async getZones() {
  //     const result = await this.zServ.listZone().toPromise();
  //     if (result) {
  //       this.Zones = result;
  //     } else {
  //       console.error('Ocurrio un error al buscar las ciudades.');
  //     }
  // };

  // async loadCities(selectedState: number) {

  //   const state = this.stateList.find(state => state.IdState == selectedState);
  //   if(state && this.Cities) {
  //     const c = this.Cities.filter(city => city.CityState == state.IdState);
  //     console.log(c);
  //     this.citiesValueList = c.map(c => c.IdCity);
  //     this.citiesLabelList = c.map(c => c.CityName);
  //   } else {
  //     this.showSnackBar('No se encontraron ciudades para el estado seleccionado.');
  //   }

  //   this.selectedstateId = selectedState;
  //   this.citiesSelect.disabled = false;
  //   this.zoneSelect.value = -2;
  //   this.zoneSelect.disabled = true;
  // };

  // async loadZones(selectedCity: number) {

  //   const city = this.Cities.find(c => c.IdCity === selectedCity);
  //   if(city && city.Zones) {
  //     const zones = city.Zones.filter(zone => zone.City === selectedCity);
  //     if(zones) {
  //     this.zonesValueList = zones.map(zone => zone.IdZone);
  //     this.zonesLabelList = zones.map(zone => zone.ZoneName);
  //     this.zoneSelect.disabled = false;
  //     // this.selectionchange();
  //     } else {
  //       this.showSnackBar('No se encontraron zonas para la ciudad seleccionada.');
  //     }
  //   }
  // };

  // selectionchange() {
  //   this.filteredlist.data = this.dataSource.data.slice(); // Inicializa filteredData
  //   // this.nameAdd();
  //     this.columns = this.getTableColumns();
  //     this.resultsLength = this.dataSource.data.length;
  //     this.dataLoaded = true;
  // };

  // onZoneSelectionChange(event: MatSelectChange) {
  //   this.selectedzoneId = event.value;
  //   // if (this.selectedzoneId === -1) {
  //   //   this.nameAdd();
  //   // } else if (this.selectedzoneId) {
  //     // Filtrar los datos según el IdState seleccionado y agregar nombres de estados
  //     this.filteredlist.data = this.dataSource.data
  //       .filter(shippment => shippment.Shippments && shippment.Shippments.TargetZone === this.selectedzoneId);
  //     // this.nameAdd();
  //   // }
  //   this.resultsLength = this.filteredlist.data.length;
  // };

  async ngOnInit() {
    // await this.getStates();
    // await this.getCities();
    // await this.getZones();
    await this.refreshMethod();
  };
}
