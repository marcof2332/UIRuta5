import { Component, ViewChild, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ValidatorsService } from '../../services/validators.service';
import { TableColumn } from '../../components/component-interfaces/TableColumn.interface';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { take } from 'rxjs';

import { SharedTableComponent } from '../../components/shared-table/shared-table.component';
import { SharedFormComponent } from '../../components/shared-form/shared-form.component';
import { SharedInput } from '../../components/component-interfaces/shared-input.interface';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

import { StagesService } from '../../services/stages.service';
import { Stage } from 'src/app/Interfaces/stage.interface';
import { DataSource } from '@angular/cdk/collections';


@Component({
  selector: 'stages-mng',
  templateUrl: './stages.component.html',
  styleUrls: ['./stages.component.css']
})
export class StagesComponent implements OnInit {

  constructor(
    private fb: FormBuilder, //importo un servicio para que me ayude a crear dinamicamente la form.
    private dialog: MatDialog, //Me permite crear un dialog, que voy a utilizar a la hora de eliminar
    private snackBar: MatSnackBar,
    private stageService: StagesService,
    private validatorsService: ValidatorsService,
    ) { }


  //Table
  columns: TableColumn[] = [];
  dataSource: MatTableDataSource<Stage> = new MatTableDataSource();
  @ViewChild(MatTable) table!: SharedTableComponent;
  @ViewChild(SharedFormComponent) form!: SharedFormComponent;
  resultsLength: number = 0;
  dataLoaded = false;
  isEmpty!: boolean;

  //Form
  public myForm: FormGroup = this.fb.group({
    // las 3 partes de esta validacion es '' = valor inicial, [] = validador sincronos y [] = validadores asincronos o sea name: ['', [], []]
    IdSStage: [''],
    StageDescription: ['', [Validators.required, Validators.minLength(3)]]
  });

  getFormFields(): SharedInput[] {
    return [
      { field: 'IdSStage', label: 'Identificador', type: 'number', formControlName: 'IdSStage' },
      { field: 'StageDescription', label: 'Descripcion', type: 'text', formControlName: 'StageDescription' },
    ];
  };

  getTableColumns(): TableColumn[] {
    return [
      { header: 'Identificador', field: 'IdSStage', type: 'text' },
      { header: 'Descripcion', field: 'StageDescription', type: 'text' },
      { header: ' ', field: 'delete', type: 'button', color: 'mat-warn', icon: 'delete', action: (item) => this.deleteStage(item.IdSStage) },
      { header: '  ', field: 'edit', type: 'button', color: 'mat-primary', icon: 'edit_square', action: (item) => this.openDialogToModify(item) }
    ];
  };

  async ngOnInit() {
    this.refreshMethod();
  }

  showSnackBar( message: string ): void {
    this.snackBar.open( message, 'cerrar', {
      duration: 4000,
    })
  }

  refreshMethod() {
    this.stageService.listStages().subscribe(
      (result) => {
        if (result != null) {
          this.dataSource.data = result; // Guarda los datos originales
          this.columns = this.getTableColumns();
          this.resultsLength = this.dataSource.data.length;
          this.dataLoaded = true;
          this.isEmpty = this.dataSource.data.length === 0;
        } else {
          this.showSnackBar('Ocurrió un error al mostrar las etapas.');
        }
      },
      (error) => {
        this.showSnackBar(error);
      }
    );
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
        { controlName: 'IdSStage', hidden: true},
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
      const st: Stage = {
        IdSStage: 0,
        StageDescription: formValues.StageDescription,
      };
      //Metodo Para agregar una licencia
      this.stageService.addStage( st ).subscribe(
        (response) => {
        this.showSnackBar(`La etapa fue agregada satisfactoriamente`);
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
        { controlName: 'IdSStage', value: item.IdSStage, disable: true },
        { controlName: 'StageDescription', value: item.StageDescription },
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
        const st: Stage = {
          IdSStage: item.IdSStage,
          StageDescription: formValues.StageDescription,
        };

        //Metodo Para modificar una licencia
        this.stageService.modifyStage( st ).subscribe(
          (response) => {
          this.showSnackBar(`La etapa fue modificada satisfactoriamente`);
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

  deleteStage(id: number) {
    console.log(id);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, { //DialogOverviewExampleDialog es el componente para mostrar la confirmacion.
      data: "Esta etapa se eliminara permanentemente ¿Esta seguro que desea continuar?"
    });

    dialogRef.afterClosed()
    .subscribe(
    (confirmado: boolean) => {
      if(confirmado){
      this.stageService.deleteStage(id).subscribe(
        (result) => {
          this.showSnackBar('La etapa se elimino satisfactoriamente!')
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
