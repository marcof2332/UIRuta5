import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { take } from 'rxjs';
//Services
import { VehicleService } from '../../services/vehicle.service';
import { ValidatorsService } from '../../services/validators.service';
import { VehicleConditionService } from '../../services/vehicle-condition.service';
//SharedComponents
import { SharedTableComponent } from '../../components/shared-table/shared-table.component';
import { SharedFormComponent } from '../../components/shared-form/shared-form.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { SharedInput } from '../../components/component-interfaces/shared-input.interface';
//Interfaces
import { TableColumn } from '../../components/component-interfaces/TableColumn.interface';
import { Vehicle } from 'src/app/Interfaces/vehicle.interface';
import { VehicleCondition } from 'src/app/Interfaces/vehicle-condition.interface';

@Component({
  selector: 'vehicle-mng',
  templateUrl: './vehicles.component.html',
  styleUrls: ['./vehicles.component.css']
})

export class VehiclesComponent implements OnInit {

  constructor(
    private vCond: VehicleConditionService,
    private vehicle: VehicleService,
    private fb: FormBuilder, //importo un servicio para que me ayude a crear dinamicamente la form.
    private dialog: MatDialog, //Me permite crear un dialog, que voy a utilizar a la hora de eliminar
    private snackBar: MatSnackBar,
    private validatorsService: ValidatorsService,
    ) { }

  //Table
  columns: TableColumn[] = [];
  dataSource: MatTableDataSource<Vehicle> = new MatTableDataSource();
  filteredlist: MatTableDataSource<Vehicle> = new MatTableDataSource();
  vCondList: VehicleCondition[] = [];
  @ViewChild(MatTable) table!: SharedTableComponent;
  @ViewChild(SharedFormComponent) form!: SharedFormComponent;
  resultsLength: number = 0;
  dataLoaded = false;
  isEmpty!: boolean;

  //Select
  vehicleValueList: number[] = [];
  vehicleLabelList: string[] = [];

  getTableColumns(): TableColumn[] {
    return [
      { header: 'Identificador', field: 'IdVehicle', type: 'text' },
      { header: 'Patente', field: 'Plate', type: 'text' },
      { header: 'Padron', field: 'vRegistration', type: 'text' },
      { header: 'Marca/Modelo', field: 'BrandModel', type: 'text' },
      { header: 'Capacidad', field: 'VehicleWeight', type: 'text' },
      { header: 'Estado', field: 'CondName', type: 'text' },
      { header: ' ', field: 'delete', type: 'button', color: 'mat-warn', icon: 'delete', action: (item) => this.deleteVehicle(item.Category) },
      { header: '  ', field: 'edit', type: 'button', color: 'mat-primary', icon: 'edit_square', action: (item) => this.openDialogToModify(item) }
    ];
  };

  //Form
  public myForm: FormGroup = this.fb.group({
    // las 3 partes de esta validacion es '' = valor inicial, [] = validador sincronos y [] = validadores asincronos o sea name: ['', [], []]
    IdVehicle: ['', [Validators.required ]],
    Plate: ['', [Validators.required, Validators.pattern(this.validatorsService.platePattern) ]],
    vRegistration: ['', [Validators.required, Validators.minLength(6)]],
    BrandModel: ['', [Validators.required, Validators.minLength(6)]],
    VehicleWeight: ['', [Validators.required ]],
    Condition: ['', [Validators.required ]],
  });

  async ngOnInit() {
    await this.getVCond();
    this.refreshMethod();
  }

  getFormFields(): SharedInput[] {
    return [
      { field: 'IdVehicle',label: 'Identificador', type: 'number', formControlName: 'IdVehicle' },
      { field: 'Plate', label: 'Patente', type: 'text', formControlName: 'Plate' },
      { field: 'vRegistration', label: 'Padron', type: 'number', formControlName: 'vRegistration' },
      { field: 'BrandModel', label: 'Marca/Modelo', type: 'text', formControlName: 'BrandModel' },
      { field: 'VehicleWeight', label: 'Capacidad', type: 'number', formControlName: 'VehicleWeight' },
      { field: 'Condition', label: 'Estado', type: 'select', formControlName: 'Condition', optionsValue: this.vehicleValueList, optionsLabel: this.vehicleLabelList },
    ];
  };

  //Metodo para mostrar un snackbar con un mensaje
  showSnackBar( message: string ): void {
    this.snackBar.open( message, 'cerrar', {
      duration: 4000,
    })
  };

  async getVCond() {
    try {
      const result = await this.vCond.listVCondition().toPromise();
      if (result) {
        this.vCondList = result;
        this.vehicleValueList = result.map((vCondition) => vCondition.IdVC);
        this.vehicleLabelList = result.map((vCondition) => vCondition.CondName);
      } else {
        console.error('La respuesta es undefined.');
      }
    } catch (error) {
      console.error('Error al obtener los estados:', error);
    }
  }

  refreshMethod() {
    this.vehicle.listVehicle().subscribe(
      (result) => {
        if (result != null) {
          this.dataSource.data = result;
          this.filteredlist.data = this.dataSource.data.slice(); // Inicializa filteredData

          this.filteredlist.data = result.map((cond) => {
            const condition = this.vCondList.find((c) => c.IdVC === cond.Condition);
            return { ...cond, CondName: condition ? condition.CondName : 'test' };
          });

          this.columns = this.getTableColumns();
          this.resultsLength = result.length;
          this.dataLoaded = true;

          // Testear
          this.isEmpty = this.dataSource.data.length === 0;
        } else {
          this.showSnackBar('Ocurrio un error al mostrar los vehiculos.');
        }
      },
      (error) => {
        this.showSnackBar(error);
      }
    );
  }

  deleteVehicle(id: number) {
    console.log(id);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, { //DialogOverviewExampleDialog es el componente para mostrar la confirmacion.
      data: "El vehiculo se eliminara permanentemente ¿Esta seguro que desea continuar?"
    });

    dialogRef.afterClosed()
    .subscribe(
    (confirmado: boolean) => {
      if(confirmado){
      this.vehicle.deleteVehicle(id).subscribe(
        (result) => {
          this.showSnackBar('El vehiculo se elimino satisfactoriamente!')
          this.refreshMethod();
        },
        (error) => {
          this.showSnackBar(error);
        }
      );
    }
    });
  }

  openDialogToAdd() {
    const dialogo1 = this.dialog.open(SharedFormComponent, { //Abro la instancia de el formulario creado con un Matdialog
      data: {
        form: this.myForm, //Obtengo los validadores.
        formFields: this.getFormFields(), //Obtengo los campos de el formulario.
      },
      disableClose: true, //Desactivo que el formulario se pueda cerrar al presionar fuera.
    });

    //Me subscribo al evento onSubmit del formulario.
    dialogo1.componentInstance.formSubmit
    .pipe(
      take(1)) // Limita la suscripción a un único evento
      .subscribe((formValues: any) => {

        //Crear una objeto con los valores del formulario reutilizable.
      const v: Vehicle = {
        IdVehicle: 0,
        Plate: formValues.Plate,
        vRegistration: formValues.vRegistration,
        BrandModel: formValues.BrandModel,
        VehicleWeight: formValues.VehicleWeight,
        Condition: formValues.Condition,
      };

      //Metodo Para agregar una licencia
      this.vehicle.addVehicle( v ).subscribe(
        (response) => {
        this.showSnackBar(`El vehiculo fue agregado satisfactoriamente`);
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
        { controlName: 'IdVehicle', value: item.IdVehicle, hidden: true},
        { controlName: 'Plate', value: item.Plate },
        { controlName: 'vRegistration', value: item.vRegistration },
        { controlName: 'BrandModel', value: item.BrandModel },
        { controlName: 'VehicleWeight', value: item.VehicleWeight },
        { controlName: 'Condition', value: item.Condition },
    ];

    Object.keys(item).forEach(controlName => {
      const control = dialogo1.componentInstance.myForm.get(controlName);
      if (control) {
        control.setValue(item[controlName]); // Asigna el valor de 'item' al control correspondiente
        if (controlsToSet.find(info => info.controlName === controlName)!.hidden) {
          control.setValidators(null);
          control.disable(); // Deshabilita el control si 'hidden' es verdadero
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
        const v: Vehicle = {
          IdVehicle      :  item.IdVehicle,
          Plate          :  formValues.Plate,
          vRegistration  :  formValues.vRegistration,
          BrandModel     :  formValues.BrandModel,
          VehicleWeight  :  formValues.VehicleWeight,
          Condition      :  formValues.Condition,
        };

        console.log(v);
      //Metodo Para modificar una licencia
      this.vehicle.modifyVehicle( v ).subscribe(
        (response) => {
        this.showSnackBar(`El vehiculo fue modificado satisfactoriamente`);
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


}
