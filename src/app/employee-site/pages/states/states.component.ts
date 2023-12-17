import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { take } from 'rxjs';
//Components
import { SharedTableComponent } from '../../components/shared-table/shared-table.component';
import { SharedFormComponent } from '../../components/shared-form/shared-form.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
//Services
import { ValidatorsService } from '../../services/validators.service';
import { StateService } from '../../services/state.service';
//Interfaces
import { TableColumn } from '../../components/component-interfaces/TableColumn.interface';
import { State } from 'src/app/Interfaces/state.interface';
import { SharedInput } from '../../components/component-interfaces/shared-input.interface';

@Component({
  selector: 'st-mng',
  templateUrl: './states.component.html',
  styleUrls: ['./states.component.css']
})
export class StatesComponent {

  constructor(
    private stateService: StateService,
    private fb: FormBuilder, //importo un servicio para que me ayude a crear dinamicamente la form.
    private dialog: MatDialog, //Me permite crear un dialog, que voy a utilizar a la hora de eliminar
    private snackBar: MatSnackBar,
    ) { }

  //Table
  columns: TableColumn[] = [];
  dataSource: MatTableDataSource<State> = new MatTableDataSource();
  @ViewChild(MatTable) table!: SharedTableComponent;
  @ViewChild(SharedFormComponent) form!: SharedFormComponent;
  resultsLength: number = 0;
  dataLoaded = false;
  isEmpty!: boolean;

  getTableColumns(): TableColumn[] {
    return [
      { header: 'Identificador', field: 'IdState', type: 'text' },
      { header: 'Nombre', field: 'StateName', type: 'text' },
      { header: ' ', field: 'delete', type: 'button', color: 'mat-warn', icon: 'delete', action: (item) => this.deleteState(item.IdState) },
      { header: '  ', field: 'edit', type: 'button', color: 'mat-primary', icon: 'edit_square', action: (item) => this.openDialogToModify(item) }
    ];
  };

  //Form
  public myForm: FormGroup = this.fb.group({
    // las 3 partes de esta validacion es '' = valor inicial, [] = validador sincronos y [] = validadores asincronos o sea name: ['', [], []]
    IdState: ['', [Validators.required]],
    StateName: ['', [Validators.required, Validators.minLength(3)]],
  });

  getFormFields(): SharedInput[] {
    return [
      { field: 'IdState', label: 'Identificador', type: 'number', formControlName: 'IdState' },
      { field: 'StateName', label: 'Nombre', type: 'text', formControlName: 'StateName' },
    ];
  };

  ngOnInit(): void {
    this.refreshMethod();
  }

  refreshMethod() {

    this.stateService.listStates().subscribe(
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
        this.showSnackBar('Ocurrio un error al mostrar los departamentos.');
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
        { controlName: 'IdState', hidden: true},
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
      const st: State = {
        IdState: 0,
        StateName: formValues.StateName,
      };

      console.log(st.StateName);
      //Metodo Para agregar una licencia
      this.stateService.addStates( st ).subscribe(
        (response) => {
        this.showSnackBar(`El departamento fue agregado satisfactoriamente`);
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
        { controlName: 'IdState', value: item.IdState, disable: true },
        { controlName: 'StateName', value: item.StateName },
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
        const st: State = {
          IdState: item.IdState,
          StateName: formValues.StateName,
          Cities: item.Cities
        };

        //Metodo Para modificar una licencia
        this.stateService.modifyState( st ).subscribe(
          (response) => {
          this.showSnackBar(`El departamento fue modificado satisfactoriamente`);
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

  deleteState(st: number) {
    //ConfirmDialogComponent es el componente para solicitar la confirmacion.
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: "Este departamento se eliminara permanentemente ¿Esta seguro que desea continuar?"
    });

    dialogRef.afterClosed()
    .subscribe(
    (confirmado: boolean) => {
      if(confirmado){
      this.stateService.deleteState(st).subscribe(
        (result) => {
          this.showSnackBar('El departamento se elimino satisfactoriamente!')
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
