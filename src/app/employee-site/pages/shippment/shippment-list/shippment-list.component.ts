import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder } from '@angular/forms';
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
import { BranchOfficeService } from 'src/app/employee-site/services/branch-office.service';
import { ValidatorsService } from 'src/app/employee-site/services/validators.service';
import { SharedmapdataService } from 'src/app/employee-site/services/sharedmapdata.service';
import { StateService } from 'src/app/employee-site/services/state.service';
import { CitiesService } from 'src/app/employee-site/services/cities.service';
import { ShippmentService } from 'src/app/employee-site/services/shippment.service';
import { ShippmentList } from 'src/app/Interfaces/list-shippment.interface';
import { RoleService } from 'src/app/employee-site/services/role.service';

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
    private BranchService: BranchOfficeService,
    private shippmentService: ShippmentService,
    private fb: FormBuilder, //importo un servicio para que me ayude a crear dinamicamente la form.
    private dialog: MatDialog, //Me permite crear un dialog, que voy a utilizar a la hora de eliminar
    private snackBar: MatSnackBar,
    private validatorsService: ValidatorsService,
    private chMap: SharedmapdataService,
    ) { }

  //Table
  columns: TableColumn[] = [];
  dataSource: MatTableDataSource<ShippmentList>= new MatTableDataSource(); //Datos originales
  filteredlist: MatTableDataSource<ShippmentList> = new MatTableDataSource(); //Datos filtrados por los select

  @ViewChild(MatTable) table!: SharedTableComponent;
  //@ViewChild(OfficeFormComponent) form!: OfficeFormComponent;
  resultsLength: number = 0;
  dataLoaded = false;
  isEmpty!: boolean;

  //Selects
  @ViewChild('cities') citiesSelect!: MatSelect;
  @ViewChild('zone') zoneSelect!: MatSelect;
  Cities: City[] = [];
  Zones: Zone[] = [];
  stateList: State[] = [];

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
      //{ header: 'Identificador', field: 'IdShippment', type: 'text' },
      { header: 'Remitente', field: 'Sender', type: 'text' },
      { header: 'Fecha ingresado', field: 'ReceiptDate', type: 'date' },
      { header: 'Destinatario', field: 'Recipient', type: 'text' },
      { header: 'Telefono', field: 'RecipientCel', type: 'text' },
      { header: 'Zona', field: 'ZoneName', type: 'text' },
      { header: 'Direccion', field: 'TargetAddress', type: 'text' },
      { header: 'Con Retiro', field: 'HomeOrDrop', type: 'text' }
    ];
  };

  //Metodo para mostrar un snackbar con un mensaje
  showSnackBar( message: string ): void {
    this.snackBar.open( message, 'cerrar', {
      duration: 4000,
    })
  };

  async getStates() {
    const result = await this.StateService.listStates().toPromise();
    if (result) {
      this.stateList = result;
      this.statesValueList = result.map((state) => state.IdState);
      this.statesLabelList = result.map((state) => state.StateName);
    } else {
      this.showSnackBar('Error al obtener los departamentos');
    }
  };

  async getCities() {
    try {
      const result = await this.CitiesService.listCities().toPromise();

      if (result) {
        this.Cities = result;
      } else {
        console.error('Ocurrio un error al buscar las ciudades.');
      }
    } catch (error) {
      this.showSnackBar('Error al obtener los ciudades');
    }
  };

  async getZones() {
      const result = await this.zServ.listZone().toPromise();
      if (result) {
        this.Zones = result;
      } else {
        console.error('Ocurrio un error al buscar las ciudades.');
      }
  };

  async loadCities(selectedState: number) {

    const state = this.stateList.find(state => state.IdState == selectedState);
    if(state && this.Cities) {
      const c = this.Cities.filter(city => city.CityState == state.IdState);
      console.log(c);
      this.citiesValueList = c.map(c => c.IdCity);
      this.citiesLabelList = c.map(c => c.CityName);
    } else {
      this.showSnackBar('No se encontraron ciudades para el estado seleccionado.');
    }

    this.selectedstateId = selectedState;
    this.citiesSelect.disabled = false;
    this.zoneSelect.value = -2;
    this.zoneSelect.disabled = true;
  };

  async loadZones(selectedCity: number) {

    const city = this.Cities.find(c => c.IdCity === selectedCity);
    if(city && city.Zones) {
      const zones = city.Zones.filter(zone => zone.City === selectedCity);
      if(zones) {
      this.zonesValueList = zones.map(zone => zone.IdZone);
      this.zonesLabelList = zones.map(zone => zone.ZoneName);
      this.zoneSelect.disabled = false;
      this.selectionchange();
      } else {
        this.showSnackBar('No se encontraron zonas para la ciudad seleccionada.');
      }
    }
  };

  orderResults(){
      this.dataSource.data.forEach(element => {
        if(element.Shippments) {
          element.IdShippment = element.Shippments.IdShippment;
          element.ReceiptDate = element.Shippments.ReceiptDate;
          element.Sender = element.Shippments.Sender;
          element.Recipient = element.Shippments.Recipient;
          element.RecipientCel = element.Shippments.RecipientCel;
          element.TargetZone = element.Shippments.TargetZone;
          element.TargetAddress = element.Shippments.TargetAddress;
          element.TargetLocation = element.Shippments.TargetLocation;
        }
        if(element.PickUpLocation != undefined) {
          element.HomeOrDrop = "Si";
          element.PickUpZone = element.TargetZone;
        }
        else element.HomeOrDrop = "No"
      });
  };

  nameAdd() {
    this.filteredlist.data = this.filteredlist.data.map((shippment) => {
      const zo = this.Zones.find((z) => z.IdZone === shippment.TargetZone);
      return { ...shippment, ZoneName: zo ? zo.ZoneName : 'test' };
    });
  };

  async refreshMethod() {

    this.shippmentService.listAllShippments().subscribe(
      (result) => {
        console.log(result);
        if (result != null) {
          this.dataSource.data = result;
          this.filteredlist.data = this.dataSource.data.slice(); // Inicializa filteredData
          this.orderResults();
          this.nameAdd()
          this.columns = this.getTableColumns();
          console.log(this.dataSource.data)
          this.resultsLength = result.length;
          this.dataLoaded = true;
          // Testear
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

  selectionchange() {
    this.filteredlist.data = this.dataSource.data.slice(); // Inicializa filteredData
    this.nameAdd();
      this.columns = this.getTableColumns();
      this.resultsLength = this.dataSource.data.length;
      this.dataLoaded = true;
  };

  onZoneSelectionChange(event: MatSelectChange) {
    this.selectedzoneId = event.value;
    if (this.selectedzoneId === -1) {
      this.nameAdd();
    } else if (this.selectedzoneId) {
      // Filtrar los datos según el IdState seleccionado y agregar nombres de estados
      this.filteredlist.data = this.dataSource.data
        .filter(shippment => shippment.Shippments && shippment.Shippments.TargetZone === this.selectedzoneId);
      this.nameAdd();
    }
    this.resultsLength = this.filteredlist.data.length;
  };

  async ngOnInit() {
    await this.getStates();
    await this.getCities();
    await this.getZones();
    await this.refreshMethod();
  };
}
