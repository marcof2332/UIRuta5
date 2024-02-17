import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
//Services
import { VehicleConditionService } from '../../services/vehicle-condition.service';
import { ValidatorsService } from '../../services/validators.service';
//SharedComponents
import { TableColumn } from '../../components/component-interfaces/TableColumn.interface';
import { SharedTableComponent } from '../../components/shared-table/shared-table.component';
import { SharedFormComponent } from '../../components/shared-form/shared-form.component';
import { SharedInput } from '../../components/component-interfaces/shared-input.interface';
//Interfaces
import { VehicleCondition } from 'src/app/Interfaces/vehicle-condition.interface';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { take } from 'rxjs';

@Component({
  selector: 'vst-mng',
  templateUrl: './vehicle-condition.component.html',
  styleUrls: ['./vehicle-condition.component.css']
})
export class VehicleConditionComponent implements OnInit{

  constructor(
    private vehicleCond: VehicleConditionService,
    private fb: FormBuilder, //importo un servicio para que me ayude a crear dinamicamente la form.
    private dialog: MatDialog, //Me permite crear un dialog, que voy a utilizar a la hora de eliminar
    private snackBar: MatSnackBar,
    private validatorsService: ValidatorsService,
    ) { }

  //Table
  columns: TableColumn[] = [];
  dataSource: MatTableDataSource<VehicleCondition> = new MatTableDataSource();
  @ViewChild(MatTable) table!: SharedTableComponent;
  @ViewChild(SharedFormComponent) form!: SharedFormComponent;
  resultsLength: number = 0;
  dataLoaded = false;
  isEmpty!: boolean;

  getTableColumns(): TableColumn[] {
    return [
      { header: 'Identificador', field: 'IdVC', type: 'text' },
      { header: 'Titulo', field: 'CondName', type: 'text' },
      { header: ' ', field: 'delete', type: 'button', color: 'mat-warn', icon: 'delete', action: (item) => this.deleteVCond(item.IdVC) },
      { header: '  ', field: 'edit', type: 'button', color: 'mat-primary', icon: 'edit_square', action: (item) => this.openDialogToModify(item) }
    ];
  };

  //Form
  public myForm: FormGroup = this.fb.group({
    // las 3 partes de esta validacion es '' = valor inicial, [] = validador sincronos y [] = validadores asincronos o sea name: ['', [], []]
    IdVC: ['', [Validators.required ]],
    CondName: ['', [Validators.required, Validators.minLength(3) ]],
  });

  ngOnInit(): void {
    this.refreshMethod();
  }

  getFormFields(): SharedInput[] {
    return [
      { field: 'IdVC',label: 'Identificador', type: 'number', formControlName: 'IdVC' },
      { field: 'CondName', label: 'Titulo', type: 'text', formControlName: 'CondName' },
    ];
  };

  refreshMethod() {

    this.vehicleCond.listVCondition().subscribe(
      (result) => {

        console.log(result);
        if (result != null) {
          this.dataSource.data = result;
          this.columns = this.getTableColumns();
          this.resultsLength = result.length;
          this.dataLoaded = true;

        // Testear
        this.isEmpty = this.dataSource.data.length === 0;
        }
        else
        this.showSnackBar('Ocurrio un error al mostrar los estados.');
      },
      (error) => { this.showSnackBar(error); }
    );
  }

  //Metodo para mostrar un snackbar con un mensaje
  showSnackBar( message: string ): void {
    this.snackBar.open( message, 'cerrar', {
      duration: 4000,
    })
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
        { controlName: 'IdVC', hidden: true},
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
        const vc: VehicleCondition = {
          IdVC: 0,
          CondName: formValues.CondName
        };

      //Metodo Para agregar una licencia
      this.vehicleCond.addVCondition( vc ).subscribe(
        (response) => {
        this.showSnackBar(`El estado fue agregado satisfactoriamente`);
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
        { controlName: 'IdVC', value: item.IdVC, disable: true },
        { controlName: 'CondName', value: item.CondName },
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
      const vc: VehicleCondition = {
        IdVC: item.IdVC,
        CondName: formValues.CondName
      };

      //Metodo Para modificar una licencia
      this.vehicleCond.modifyVCondition( vc ).subscribe(
        (response) => {
        this.showSnackBar(`El estado fue modificado satisfactoriamente`);
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

  deleteVCond(id: number) {
    console.log(id);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, { //DialogOverviewExampleDialog es el componente para mostrar la confirmacion.
      data: "Este estado se eliminara permanentemente ¿Esta seguro que desea continuar?"
    });

    dialogRef.afterClosed()
    .subscribe(
    (confirmado: boolean) => {
      if(confirmado){
      this.vehicleCond.deleteVCondition(id).subscribe(
        (result) => {
          this.showSnackBar('El estado se elimino satisfactoriamente!')
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
