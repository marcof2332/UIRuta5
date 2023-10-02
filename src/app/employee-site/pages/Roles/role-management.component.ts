import { Component, ViewChild, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { Role } from 'src/app/Interfaces/role.interface';
import { TableColumn } from 'src/app/employee-site/components/component-interfaces/TableColumn.interface';
import { SharedTableComponent } from 'src/app/employee-site/components/shared-table/shared-table.component';
import { RoleService } from 'src/app/employee-site/services/role.service';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { catchError, filter, of, switchMap, take } from 'rxjs';
import { SharedFormComponent } from '../../components/shared-form/shared-form.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidatorsService } from '../../services/validators.service';
import { SharedInput } from '../../components/component-interfaces/shared-input.interface';

@Component({
  selector: 'app-role-management',
  templateUrl: './role-management.component.html',
  styleUrls: ['./role-management.component.css']
})
export class RoleManagementComponent implements OnInit{

  constructor(
    private roleService: RoleService,
    private fb: FormBuilder, //importo un servicio para que me ayude a crear dinamicamente la form.
    private dialog: MatDialog, //Me permite crear un dialog, que voy a utilizar a la hora de eliminar
    private snackBar: MatSnackBar,
    private validatorsService: ValidatorsService,
    ) { }

//Table
columns: TableColumn[] = [];
dataSource: MatTableDataSource<Role> = new MatTableDataSource();
@ViewChild(MatTable) table!: SharedTableComponent;
@ViewChild(SharedFormComponent) form!: SharedFormComponent;
resultsLength: number = 0;
dataLoaded = false;
isEmpty!: boolean;

//Form
public myForm: FormGroup = this.fb.group({
  // las 3 partes de esta validacion es '' = valor inicial, [] = validador sincronos y [] = validadores asincronos o sea name: ['', [], []]
  code: ['', [Validators.required, Validators.pattern(this.validatorsService.codePattern) ]],
  rolesdescription: ['', [Validators.required, ]],
});

  refreshMethod() {

    this.roleService.listRoles().subscribe(
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
        this.showSnackBar('Ocurrio un error al mostrar los roles.');
      },
      (error) => { this.showSnackBar(error); }
    );
  }

  ngOnInit(): void {
    this.refreshMethod();
  }

  getTableColumns(): TableColumn[] {
    return [
      { header: 'Codigo', field: 'Code', type: 'text' },
      { header: 'Descripcion', field: 'RolesDescription', type: 'text' },
      { header: ' ', field: 'delete', type: 'button', color: 'mat-warn', icon: 'delete', action: (item) => this.deleteRole(item.Code) },
      { header: '  ', field: 'edit', type: 'button', color: 'mat-primary', icon: 'edit_square', action: (item) => this.openDialogToModify(item) }
    ];
  };

  getFormFields(): SharedInput[] {
    return [
      { field: 'Code',label: 'Codigo', type: 'text', formControlName: 'code' },
      { field: 'RolesDescription', label: 'Descripcion', type: 'text', formControlName: 'rolesdescription' },
    ];
  };

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

    //Me subscribo al evento onSubmit del formulario.
    dialogo1.componentInstance.formSubmit
    .pipe(
      take(1)) // Limita la suscripción a un único evento
      .subscribe((formValues: any) => {

        //Crear una objeto con los valores del formulario reutilizable.
      const r: Role = {
        Code: formValues.code,
        RolesDescription: formValues.rolesdescription
      };

      //Metodo Para agregar
      this.roleService.addRole( r ).subscribe(
        (response) => {
        this.showSnackBar(`El rol fue agregado satisfactoriamente`);
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

      const codeControl = dialogo1.componentInstance.myForm.get('code');
      const descriptionControl = dialogo1.componentInstance.myForm.get('rolesdescription');

      if (codeControl && descriptionControl) {
        // Asigna los valores del objeto 'item' a los controles correspondientes
        codeControl.setValue(item.Code);
        codeControl.disable();
        descriptionControl.setValue(item.RolesDescription);
      }
    });

    //Me subscribo al evento onSubmit del formulario.
    dialogo1.componentInstance.formSubmit
    .pipe(
      take(1)) // Limita la suscripción a un único evento
      .subscribe((formValues: any) => {

        //Crear una objeto con los valores del formulario reutilizable.
      const li: Role = {
        Code: item.Code,
        RolesDescription: formValues.rolesdescription
      };

      //Metodo Para modificar una licencia
      this.roleService.modifyRole( li ).subscribe(
        (response) => {
        this.showSnackBar(`El rol fue modificado satisfactoriamente`);
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

  deleteRole(ro: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { //DialogOverviewExampleDialog es el componente para mostrar la confirmacion.
      data: "Este rol se eliminara permanentemente ¿Esta seguro que desea continuar?"
    });

    dialogRef.afterClosed()
    .subscribe(
    (confirmado: boolean) => {
      if(confirmado){
      this.roleService.deleteRole(ro).subscribe(
        (result) => {
          this.showSnackBar('El rol se elimino satisfactoriamente.')
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
