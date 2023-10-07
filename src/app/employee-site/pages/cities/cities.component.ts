import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ValidatorsService } from '../../services/validators.service';
import { TableColumn } from '../../components/component-interfaces/TableColumn.interface';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { take } from 'rxjs';
import { MatSelectChange } from '@angular/material/select';

import { SharedTableComponent } from '../../components/shared-table/shared-table.component';
import { SharedFormComponent } from '../../components/shared-form/shared-form.component';
import { SharedInput } from '../../components/component-interfaces/shared-input.interface';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

import { CitiesService } from '../../services/cities.service';
import { StateService } from '../../services/state.service';
import { City } from 'src/app/Interfaces/cities.interface';
import { State } from 'src/app/Interfaces/state.interface';


@Component({
  selector: 'city-mng',
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.css']
})
export class CitiesComponent implements OnInit {

  constructor(
    private cityService: CitiesService,
    private stateService: StateService,
    private fb: FormBuilder, //importo un servicio para que me ayude a crear dinamicamente la form.
    private dialog: MatDialog, //Me permite crear un dialog, que voy a utilizar a la hora de eliminar
    private snackBar: MatSnackBar,
    private validatorsService: ValidatorsService,
    ) { }

  //Select
  statesValueList: number[] = [];
  statesLabelList: string[] = [];
  stateList: State[] = []
  selectedStateId: number | null = null; // Variable para el estado seleccionado

  //Table
  columns: TableColumn[] = [];
  dataSource: MatTableDataSource<City> = new MatTableDataSource();
  filteredData: MatTableDataSource<City> = new MatTableDataSource();
  @ViewChild(MatTable) table!: SharedTableComponent;
  @ViewChild(SharedFormComponent) form!: SharedFormComponent;
  resultsLength: number = 0;
  dataLoaded = false;
  isEmpty!: boolean;

  //Form
  public myForm: FormGroup = this.fb.group({
    // las 3 partes de esta validacion es '' = valor inicial, [] = validador sincronos y [] = validadores asincronos o sea name: ['', [], []]
    IdCity: ['', [Validators.required]],
    CityName: ['', [Validators.required, Validators.minLength(3)]],
    CityState: ['', [Validators.required]],
  });

  getFormFields(): SharedInput[] {
    return [
      { field: 'IdCity', label: 'Identificador', type: 'number', formControlName: 'IdCity' },
      { field: 'CityName', label: 'Nombre', type: 'text', formControlName: 'CityName' },
      { field: 'CityState', label: 'Departamento', type: 'select', formControlName: 'CityState', optionsValue: this.statesValueList, optionsLabel: this.statesLabelList },
    ];
  };

  getTableColumns(): TableColumn[] {
    return [
      { header: 'Identificador', field: 'IdCity', type: 'text' },
      { header: 'Nombre', field: 'CityName', type: 'text' },
      { header: 'Departamento', field: 'StateName', type: 'text' },
      { header: ' ', field: 'delete', type: 'button', color: 'mat-warn', icon: 'delete', action: (item) => this.deleteCity(item.IdCity) },
      { header: '  ', field: 'edit', type: 'button', color: 'mat-primary', icon: 'edit_square', action: (item) => this.openDialogToModify(item) }
    ];
  };

  async ngOnInit() {

    await this.getStates();
    this.refreshMethod();
  }

  showSnackBar( message: string ): void {
    this.snackBar.open( message, 'cerrar', {
      duration: 4000,
    })
  }

  async getStates() {
    try {
      const result = await this.stateService.listStates().toPromise();

      if (result) {
        this.stateList = result;
        this.statesValueList = result.map((state) => state.IdState);
        this.statesLabelList = result.map((state) => state.StateName);
        console.log(this.stateList);
      } else {
        console.error('La respuesta de departamentos es undefined.');
      }
    } catch (error) {
      console.error('Error al obtener los departamentos:', error);
    }
  }

  refreshMethod() {
    this.cityService.listCities().subscribe(
      (result) => {
        if (result != null) {
          this.dataSource.data = result; // Guarda los datos originales
          this.filteredData.data = this.dataSource.data.slice(); // Inicializa filteredData
          this.filteredData.data = result.map((city) => {
            const state = this.stateList.find((s) => s.IdState === city.CityState);
            return { ...city, StateName: state ? state.StateName : '' };
          });
          this.columns = this.getTableColumns();
          this.resultsLength = this.filteredData.data.length;
          this.dataLoaded = true;
          this.isEmpty = this.filteredData.data.length === 0;
        } else {
          this.showSnackBar('Ocurrió un error al mostrar las ciudades.');
        }
      },
      (error) => {
        this.showSnackBar(error);
      }
    );
  }

  onStateSelectionChange(event: MatSelectChange) {
    this.selectedStateId = event.value;
    console.log(this.dataSource.data);
    if (this.selectedStateId === -1) {
      // Mostrar todos los datos originales
      this.filteredData.data = this.dataSource.data.map(city => {
        const state = this.stateList.find(s => s.IdState === city.CityState);
        return { ...city, StateName: state ? state.StateName : '' };
      });
    } else if (this.selectedStateId) {
      // Filtrar los datos según el IdState seleccionado y agregar nombres de estados
      this.filteredData.data = this.dataSource.data
        .filter(city => city.CityState === this.selectedStateId)
        .map(city => {
          const state = this.stateList.find(s => s.IdState === city.CityState);
          return { ...city, StateName: state ? state.StateName : '' };
        });
    } else {
      // En caso de que no se haya seleccionado ningún estado, muestra todos los datos originales
      this.filteredData.data = this.dataSource.data.map(city => {
        const state = this.stateList.find(s => s.IdState === city.CityState);
        return { ...city, StateName: state ? state.StateName : '' };
      });
    }
    // Actualiza la longitud de los resultados
    this.resultsLength = this.filteredData.data.length;
  }

  openDialogToAdd() {

    const dialogo1 = this.dialog.open(SharedFormComponent, { //Abro la instancia de el formulario creado con un Matdialog
      data: {
        form: this.myForm, //Obtengo los validadores.
        formFields: this.getFormFields(), //Obtengo los campos de el formulario.
      },
      disableClose: true, //Desactivo que el formulario se pueda cerrar al presionar fuera.
    });

    dialogo1.afterOpened().subscribe(() => {

      const controlsToSet = [
        { controlName: 'IdCity', hidden: true},
      ];

      controlsToSet.forEach((controlInfo) => {
        const control = dialogo1.componentInstance.myForm.get(controlInfo.controlName);
        if (control) {
          if (controlInfo.hidden) {
            control.disable(); // Deshabilita el control
            control.setValidators(null); // Borra los validadores para evitar errores en los controles ocultos
          }
        }
      });
    });

    //Me subscribo al evento onSubmit del formulario.
    dialogo1.componentInstance.formSubmit
    .pipe(
      take(1)) // Limita la suscripción a un único evento
      .subscribe((formValues: any) => {

        //Crear una objeto con los valores del formulario reutilizable.
      const cy: City = {
        IdCity: 0,
        CityName: formValues.CityName,
        CityState: formValues.CityState,
      };

      console.log(cy.CityName);
      //Metodo Para agregar una licencia
      this.cityService.addCity( cy ).subscribe(
        (response) => {
        this.showSnackBar(`La ciudad fue agregada satisfactoriamente`);
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
  });
    dialogo1.afterClosed()
    .subscribe((result: boolean) => {
      if (result === true) {
        this.refreshMethod();
      }
    });
  }

  openDialogToModify(item: any) {

    console.log(item);

    const dialogo1 = this.dialog.open(SharedFormComponent, { //Abro la instancia de el formulario creado con un Matdialog
      data: {
        form: this.myForm, //Obtengo los validadores.
        formFields: this.getFormFields(), //Obtengo los campos de el formulario.
        item: item, // Pasa el objeto item como parte de los datos
      },
      disableClose: true, //Desactivo que el formulario se pueda cerrar al presionar fuera.
    });

    dialogo1.afterOpened().subscribe(() => {

      const controlsToSet = [
        { controlName: 'IdCity', value: item.IdCity, disable: true },
        { controlName: 'CityName', value: item.CityName },
        { controlName: 'CityState', value: item.CityState, disable: true },
      ];

      controlsToSet.forEach((controlInfo) => {
        const control = dialogo1.componentInstance.myForm.get(controlInfo.controlName);
        if (control) {
          control.setValue(controlInfo.value);
          if (controlInfo.disable) {
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

        //Crear una objeto con los valores del formulario reutilizable.
        const cy: City = {
          IdCity: item.IdCity,
          CityName: formValues.CityName,
          CityState: formValues.CityState,
        };

        //Metodo Para modificar una licencia
        this.cityService.modifyCity( cy ).subscribe(
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
    });
    dialogo1.afterClosed()
    .subscribe((result: boolean) => {
      if (result === true) {
        this.refreshMethod();
      }
    });
  }

  deleteCity(id: number) {
    console.log(id);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, { //DialogOverviewExampleDialog es el componente para mostrar la confirmacion.
      data: "Esta ciudad se eliminara permanentemente ¿Esta seguro que desea continuar?"
    });

    dialogRef.afterClosed()
    .subscribe(
    (confirmado: boolean) => {
      if(confirmado){
      this.cityService.deleteCity(id).subscribe(
        (result) => {
          this.showSnackBar('La ciudad se elimino satisfactoriamente!')
          this.refreshMethod();
        },
        (error) => {
          this.showSnackBar(error);
        }
      );
    }
    });
  }
}
