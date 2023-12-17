import { State } from './../../../Interfaces/state.interface';
import { Zone } from './../../../Interfaces/zone.interface';
import { Component, OnInit, ViewChild } from '@angular/core';
import { TableColumn } from '../../components/component-interfaces/TableColumn.interface';
import { MatTable, MatTableDataSource } from '@angular/material/table';

import { BranchOffice } from 'src/app/Interfaces/branch-office.interface';
import { SharedTableComponent } from '../../components/shared-table/shared-table.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ZoneService } from '../../services/zone.service';
import { ValidatorsService } from '../../services/validators.service';
import { CitiesService } from '../../services/cities.service';
import { City } from 'src/app/Interfaces/cities.interface';
import { MatSelect, MatSelectChange } from '@angular/material/select';
import { StateService } from '../../services/state.service';
import { BranchOfficeService } from '../../services/branch-office.service';
import { SharedSimpleMapComponent } from '../../components/shared-simple-map/shared-simple-map.component';
import { OfficeFormComponent } from '../../components/office-form/office-form.component';
import { take } from 'rxjs';
import { SharedmapdataService } from '../../services/sharedmapdata.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-branch-office',
  templateUrl: './branch-office.component.html',
  styleUrls: ['./branch-office.component.css']
})
export class BranchOfficeComponent implements OnInit {

  constructor(
    private zServ: ZoneService,
    private CitiesService: CitiesService,
    private StateService: StateService,
    private BranchService: BranchOfficeService,
    private fb: FormBuilder, //importo un servicio para que me ayude a crear dinamicamente la form.
    private dialog: MatDialog, //Me permite crear un dialog, que voy a utilizar a la hora de eliminar
    private snackBar: MatSnackBar,
    private validatorsService: ValidatorsService,
    private chMap: SharedmapdataService,
    ) { }

//Table
columns: TableColumn[] = [];
dataSource: MatTableDataSource<BranchOffice> = new MatTableDataSource();
filteredlist: MatTableDataSource<BranchOffice> = new MatTableDataSource();

@ViewChild(MatTable) table!: SharedTableComponent;
@ViewChild(OfficeFormComponent) form!: OfficeFormComponent;
resultsLength: number = 0;
dataLoaded = false;
isEmpty!: boolean;

//Select
@ViewChild('cities') citiesSelect!: MatSelect;
@ViewChild('zone') zoneSelect!: MatSelect;
Cities: City[] = [];
Zones: Zone[] = [];
stateList: State[] = [];

selectedzoneId: number | null = null; // Variable para el estado seleccionado
selectedstateId: number | null = null; // Variable para el estado seleccionado
zonesValueList:  number[] = [];
zonesLabelList:  string[] = [];
citiesValueList:  number[] = [];
citiesLabelList:  string[] = [];
statesValueList:  number[] = [];
statesLabelList:  string[] = [];

getTableColumns(): TableColumn[] {
  return [
    { header: 'Identificador', field: 'IdOffice', type: 'text' },
    { header: 'Zona', field: 'ZoneName', type: 'text' },
    { header: 'Direccion', field: 'BranchAddress', type: 'text' },
    { header: 'Telefono', field: 'Phone', type: 'text' },
    { header: 'Apertura', field: 'OpTime', type: 'time' },
    { header: 'Cierre', field: 'CloseTime', type: 'time' },
    { header: 'Ubicacion', field: 'search', type: 'button', color: 'mat-primary', icon: 'search', action: (item) => this.openDialogToMap(item) },
    { header: ' ', field: 'delete', type: 'button', color: 'mat-warn', icon: 'delete', action: (item) => this.deleteOffice(item.IdOffice) },
    { header: '  ', field: 'edit', type: 'button', color: 'mat-primary', icon: 'edit_square', action: (item) => this.openDialogToModify(item) }
  ];
};
  //Form
  public myForm: FormGroup = this.fb.group({
    // las 3 partes de esta validacion es '' = valor inicial, [] = validador sincronos y [] = validadores asincronos o sea name: ['', [], []]
    OfficeState: ['', [Validators.required ]],
    OfficeCity: ['', [Validators.required ]],
    Zone: ['', [Validators.required ]],
    BranchAddress: ['', [Validators.required, Validators.minLength(3) ]],
    Phone: ['', [Validators.required, Validators.pattern(this.validatorsService.phonePattern) ]],
    OpTime: ['', [Validators.required ]],
    CloseTime: ['', [Validators.required]],
  });

  async getStates() {
      const result = await this.StateService.listStates().toPromise();
      if (result) {
        this.stateList = result;
        this.statesValueList = result.map((state) => state.IdState);
        this.statesLabelList = result.map((state) => state.StateName);
      } else {
        this.showSnackBar('Error al obtener los departamentos');
      }
  }

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
  }

  async getZones() {
      const result = await this.zServ.listZone().toPromise();
      if (result) {
        this.Zones = result;
      } else {
        console.error('Ocurrio un error al buscar las ciudades.');
      }
    }

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
  }

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
  }

  nameAdd(){
    this.filteredlist.data = this.filteredlist.data.map((branch) => {
      const zo = this.Zones.find((z) => z.IdZone === branch.BranchZone);
      return { ...branch, ZoneName: zo ? zo.ZoneName : 'test' };
    });
  }

  async refreshMethod() {
    this.BranchService.listOffices().subscribe(
      (result) => {
        console.log(result);
        if (result != null) {
          this.dataSource.data = result;
          this.filteredlist.data = this.dataSource.data.slice(); // Inicializa filteredData
          this.nameAdd();
          this.columns = this.getTableColumns();
          this.resultsLength = result.length;
          this.dataLoaded = true;
          // Testear
          this.isEmpty = this.dataSource.data.length === 0;
        } else {
          this.showSnackBar('Ocurrio un error al mostrar las zonas.');
        }
      },
      (error) => {
        this.showSnackBar(error);
      }
    );
  }

  selectionchange() {
    this.filteredlist.data = this.dataSource.data.slice(); // Inicializa filteredData
    this.nameAdd();
      this.columns = this.getTableColumns();
      this.resultsLength = this.dataSource.data.length;
      this.dataLoaded = true;
  }

  onZoneSelectionChange(event: MatSelectChange) {
    this.selectedzoneId = event.value;
    if (this.selectedzoneId === -1) {
      this.nameAdd();
    } else if (this.selectedzoneId) {
      // Filtrar los datos según el IdState seleccionado y agregar nombres de estados
      this.filteredlist.data = this.dataSource.data
        .filter(branch => branch.BranchZone === this.selectedzoneId);
      this.nameAdd();
    }
    this.resultsLength = this.filteredlist.data.length;
  }

  async ngOnInit() {
    await this.getStates();
    await this.getCities();
    await this.getZones();
    await this.refreshMethod();
  }

  //Metodo para mostrar un snackbar con un mensaje
  showSnackBar( message: string ): void {
    this.snackBar.open( message, 'cerrar', {
      duration: 4000,
    })
  };

  openDialogToMap(item: any) {

    console.log(item)
    const dialogo1 = this.dialog.open(SharedSimpleMapComponent, { //Abro la instancia de el formulario creado con un Matdialog
      data: {
        Office: item, // Pasa el objeto item como parte de los datos
      },
    });
  }

  openDialogToAdd() {
    const dialogo1 = this.dialog.open(OfficeFormComponent, { //Abro la instancia de el formulario creado con un Matdialog
      data: {
        form: this.myForm, //Obtengo los validadores.
        states: this.stateList,
        cities: this.Cities,
        zones: this.Zones,
      },
      disableClose: true, //Desactivo que el formulario se pueda cerrar al presionar fuera.
    });

    //Me subscribo al evento onSubmit del formulario.
    dialogo1.componentInstance.formSubmit
    .pipe(
      take(1)) // Limita la suscripción a un único evento
      .subscribe((formValues: any) => {

        const checkMarkerShape = this.chMap.convertLatLngLiteralToGeoPoint(formValues.MarkerLocation);

        console.log("checkMarkerShape:", checkMarkerShape);

        if(checkMarkerShape)
        {
           const b: BranchOffice = {
            IdOffice: 0,
            BranchZone: formValues.Zone,
            ZoneName: '',
            BranchAddress: formValues.BranchAddress,
            WellKnownValue: checkMarkerShape.WellKnownValue,
            CoordinateSystemId: checkMarkerShape.CoordinateSystemId,
            Phone: formValues.Phone,
            OpTime: formValues.OpTime,
            CloseTime: formValues.CloseTime,
          };

          console.log("Objeto del form: ", b);
          this.BranchService.addOffice( b ).subscribe(
            (response) => {
            this.showSnackBar(`La sucursal fue agregada satisfactoriamente`);
            //Cierro el formulario con valor true ya que si entro al response se agrego correctamente.
            dialogo1.close(true);
          },
          (error: any) => {
              //Muestro snackBar con el error
              this.showSnackBar(error)
              //Cierro el formulario con valor false ya que si entro al error no se agrego.
              dialogo1.close(false);
          }
        );
      }
  });
    dialogo1.afterClosed()
    .subscribe((result: boolean) => {
      if (result === true) {
        this.refreshMethod();
      }
    });
  }

  deleteOffice(emp: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { //DialogOverviewExampleDialog es el componente para mostrar la confirmacion.
      data: "Esta sucursal se eliminara permanentemente ¿Esta seguro que desea continuar?"
    });

    dialogRef.afterClosed()
    .subscribe(
    (confirmado: boolean) => {
      if(confirmado){
      this.BranchService.deleteOffice(emp).subscribe(
        (result) => {
          this.showSnackBar('La sucursal se elimino satisfactoriamente.')
          this.refreshMethod();
        },
        (error) => {
          this.showSnackBar(error);
        }
      );
    }
    });
  }

  openDialogToModify(item: any) {

    console.log(item);

    const dialogo1 = this.dialog.open(OfficeFormComponent, { //Abro la instancia de el formulario creado con un Matdialog
      data: {
        form: this.myForm, //Obtengo los validadores.
        item: item, // Pasa el objeto item como parte de los datos
        states: this.stateList,
        cities: this.Cities,
        zones: this.Zones,
      },
      disableClose: true, //Desactivo que el formulario se pueda cerrar al presionar fuera.
    });

    console.log(this.myForm)
    dialogo1.afterOpened().subscribe(() => {

      const controlsToSet = [
        { controlName: 'OfficeState', hidden: true},
        { controlName: 'OfficeCity', hidden: true },
        { controlName: 'Zone', value: item.BranchZone, hidden: true },
        { controlName: 'BranchAddress', value: item.BranchAddress, hidden: true },
        { controlName: 'Phone', source: item.Phone },
        { controlName: 'OpTime', value: item.OpTime },
        { controlName: 'CloseTime', value: item.CloseTime },
      ];

      dialogo1.componentInstance.disableFormControls();

      // Object.keys(item).forEach(controlName => {
      //   const control = dialogo1.componentInstance.myForm.get(controlName);
      //   if (control) {
      //     control.setValue(item[controlName]); // Asigna el valor de 'item' al control correspondiente
      //     if (controlsToSet.find(info => info.controlName === controlName)!.hidden) {
      //       control.setValidators(null);
      //       control.disable(); // Deshabilita el control si 'hidden' es verdadero
      //     }
      //   }
      // });

      controlsToSet.forEach((controlInfo) => {
        const control = dialogo1.componentInstance.myForm.get(controlInfo.controlName);
        if (control) {
          control.setValue(controlInfo.value);
          if (controlInfo.hidden) {
            control.disable();
          }
        }
      });
    });

    //Me subscribo al evento onSubmit del formulario.
    dialogo1.componentInstance.formSubmit
    .pipe(
      take(1)) // Limita la suscripción a un único evento
      .subscribe((formValues: any) => {

        const checkMarkerShape = this.chMap.convertLatLngLiteralToGeoPoint(item.MarkerLocation);

        if(checkMarkerShape) {
          const b: BranchOffice = {
            IdOffice: item.IdOffice,
            BranchZone: item.BranchZone,
            ZoneName: '',
            BranchAddress: item.BranchAddress,
            WellKnownValue: checkMarkerShape.WellKnownValue,
            CoordinateSystemId: checkMarkerShape.CoordinateSystemId,
            Phone: formValues.Phone,
            OpTime: formValues.OpTime,
            CloseTime: formValues.CloseTime,
          }

          //Metodo Para modificar una licencia
          this.BranchService.modifyOffice( b ).subscribe(
            (response) => {
            this.showSnackBar(`La ciudad fue modificada satisfactoriamente`);
            //Cierro el formulario con valor true ya que si entro al response se modifico correctamente.
            dialogo1.close(true);
          },
          (error: any) => {
              //Muestro snackBar con el error
              this.showSnackBar(error)
              //Cierro el formulario con valor false ya que si entro al error no se modifico.
              dialogo1.close(false);
          }
        );
      }
    });
      dialogo1.afterClosed()
      .subscribe((result: boolean) => {
        if (result === true) {
          this.refreshMethod();
        }
      });
    }
}
