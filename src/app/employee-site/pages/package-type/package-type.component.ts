import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { take } from 'rxjs';

import { PackageTypesService } from '../../services/package-types.service';

import { TableColumn } from '../../components/component-interfaces/TableColumn.interface';
import { PackageType } from 'src/app/Interfaces/package-type.interface';
import { SharedInput } from '../../components/component-interfaces/shared-input.interface';

import { SharedTableComponent } from '../../components/shared-table/shared-table.component';
import { SharedFormComponent } from '../../components/shared-form/shared-form.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';


@Component({
  selector: 'packagety-mng',
  templateUrl: './package-type.component.html',
  styleUrls: ['./package-type.component.css']
})
export class PackageTypeComponent implements OnInit {

  constructor(
    private pType: PackageTypesService,
    private fb: FormBuilder, //importo un servicio para que me ayude a crear dinamicamente la form.
    private dialog: MatDialog, //Me permite crear un dialog, que voy a utilizar a la hora de eliminar
    private snackBar: MatSnackBar,
    ) { }

//Table
columns: TableColumn[] = [];
dataSource: MatTableDataSource<PackageType> = new MatTableDataSource();
@ViewChild(MatTable) table!: SharedTableComponent;
@ViewChild(SharedFormComponent) form!: SharedFormComponent;
resultsLength: number = 0;
dataLoaded = false;
isEmpty!: boolean;

//Form
public myForm: FormGroup = this.fb.group({
  // las 3 partes de esta validacion es '' = valor inicial, [] = validador sincronos y [] = validadores asincronos o sea name: ['', [], []]
  IdPackageType: ['', [Validators.required, Validators.min(0) ]],
  TypeDescription: ['', [Validators.required, Validators.minLength(3)]],
  MinWeight: ['', [Validators.required, Validators.min(0) ]],
  MaxWeight: ['', [Validators.required, Validators.min(0) ]],
  Amount: ['', [Validators.required, Validators.min(0)]],
});

  refreshMethod() {

    this.pType.listPType().subscribe(
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
        this.showSnackBar('Ocurrio un error al mostrar los tipos de paquete.');
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

  ngOnInit(): void {
    this.refreshMethod();
  }

  getTableColumns(): TableColumn[] {
    return [
      { header: 'Identificador', field: 'IdPackageType', type: 'text' },
      { header: 'Descripcion', field: 'TypeDescription', type: 'text' },
      { header: 'Peso min.', field: 'MinWeight', type: 'text' },
      { header: 'Peso max.', field: 'MaxWeight', type: 'text' },
      { header: 'Precio', field: 'Amount', type: 'text' },
      { header: ' ', field: 'delete', type: 'button', color: 'mat-warn', icon: 'delete', action: (item) => this.deleteVCondition(item.Code) },
      { header: '  ', field: 'edit', type: 'button', color: 'mat-primary', icon: 'edit_square', action: (item) => this.openDialogToModify(item) }
    ];
  };

  getFormFields(): SharedInput[] {
    return [
      { field: 'IdPackageType', label: 'Identificador', type: 'number', formControlName: 'IdPackageType' },
      { field: 'TypeDescription', label: 'Descripcion', type: 'text', formControlName: 'TypeDescription' },
      { field: 'MinWeight', label: 'Peso min.', type: 'number', formControlName: 'MinWeight' },
      { field: 'MaxWeight', label: 'Peso max.', type: 'number', formControlName: 'MaxWeight' },
      { field: 'Amount', label: 'Precio', type: 'number', formControlName: 'Amount' },
    ];
  };

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
        { controlName: 'IdPackageType', hidden: true},
      ];

      controlsToSet.forEach((controlInfo) => {
        const control = dialogo1.componentInstance.myForm.get(controlInfo.controlName);
        if (control) {
          if (controlInfo.hidden) {
            control.disable(); // Deshabilita el control
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
      const pt: PackageType = {
        IdPackageType: 0,
        TypeDescription: formValues.TypeDescription,
        MinWeight: formValues.MinWeight,
        MaxWeight: formValues.MaxWeight,
        Amount: formValues.Amount,
      };

      //Metodo Para agregar una licencia
      this.pType.addPType( pt ).subscribe(
        (response) => {
        this.showSnackBar(`El tipo fue agregado satisfactoriamente`);
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
        { controlName: 'IdPackageType', value: item.IdPackageType, disable: true },
        { controlName: 'TypeDescription', value: item.TypeDescription },
        { controlName: 'MinWeight', value: item.MinWeight },
        { controlName: 'MaxWeight', value: item.MaxWeight },
        { controlName: 'Amount', value: item.Amount },
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
        const pt: PackageType = {
          IdPackageType: item.IdPackageType,
          TypeDescription: formValues.TypeDescription,
          MinWeight: formValues.MinWeight,
          MaxWeight: formValues.MaxWeight,
          Amount: formValues.Amount,
        };

        //Metodo Para modificar una licencia
        this.pType.modifyPType( pt ).subscribe(
          (response) => {
          this.showSnackBar(`El tipo fue modificado satisfactoriamente`);
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

  deleteVCondition(pt: number) {
    //ConfirmDialogComponent es el componente para solicitar la confirmacion.
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: "Este tipo se eliminara permanentemente ¿Esta seguro que desea continuar?"
    });

    dialogRef.afterClosed()
    .subscribe(
    (confirmado: boolean) => {
      if(confirmado){
      this.pType.deletePType(pt).subscribe(
        (result) => {
          this.showSnackBar('El tipo se elimino satisfactoriamente!')
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
