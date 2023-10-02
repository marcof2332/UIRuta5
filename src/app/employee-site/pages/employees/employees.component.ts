import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { take } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TableColumn } from '../../components/component-interfaces/TableColumn.interface';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
//Componentes reutilizables
import { SharedTableComponent } from '../../components/shared-table/shared-table.component';
import { SharedFormComponent } from '../../components/shared-form/shared-form.component';
import { SharedInput } from '../../components/component-interfaces/shared-input.interface';
//Servicios
import { EmployeeService } from '../../services/employee.service';
import { ValidatorsService } from '../../services/validators.service';
import { LicencesService } from '../../services/licences.service';
import { RoleService } from '../../services/role.service';
//interfaces
import { Employee } from 'src/app/Interfaces/employee.interface';



@Component({
  selector: 'emp-mng',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.css']
})
export class EmployeesComponent implements OnInit {

  constructor(
    private empService: EmployeeService,
    private licences: LicencesService,
    private roles: RoleService,
    private fb: FormBuilder, //importo un servicio para que me ayude a crear dinamicamente la form.
    private dialog: MatDialog, //Me permite crear un dialog, que voy a utilizar a la hora de eliminar
    private snackBar: MatSnackBar,
    private validatorsService: ValidatorsService,
    ) { }

  //Table
  columns: TableColumn[] = [];
  dataSource: MatTableDataSource<Employee> = new MatTableDataSource();
  @ViewChild(MatTable) table!: SharedTableComponent;
  @ViewChild(SharedFormComponent) form!: SharedFormComponent;
  resultsLength: number = 0;
  dataLoaded = false;
  isEmpty!: boolean;

  //Form
  public myForm: FormGroup = this.fb.group({
    // las 3 partes de esta validacion es '' = valor inicial, [] = validador sincronos y [] = validadores asincronos o sea name: ['', [], []]
    ID: ['', [Validators.required, Validators.pattern(this.validatorsService.empIdPattern) ]],
    EmpUser: ['', [Validators.required, Validators.minLength(3) ]],
    EmpPassword: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8) ]],
    EmpName: ['', [Validators.required, Validators.minLength(2) ]],
    EmpLastName: ['', [Validators.required, Validators.minLength(2)]],
    DateOfBirth: ['', [Validators.required]], //hay que agregar un validador para que sean mayores de 18 años
    Celphone: ['', [Validators.required, Validators.pattern(this.validatorsService.celPattern) ]],
    EmpAddress: ['', [Validators.required, Validators.minLength(3) ]],
    EmpRole: ['', [Validators.required ]],
    Licence: ['', [Validators.required ]],
  });

  licencesValueList: string[] = [];
  licencesLabelList: string[] = [];
  rolesValueList: string[] = [];
  rolesLabelList: string[] = [];

  async ngOnInit() {
    await this.getRoles(); // Esperar a que se completen los roles
    await this.getLicences(); // Esperar a que se completen las licencias
    this.refreshMethod();
  }

  async getRoles() {
    console.log('Voy a buscar los roles al back');
    try {
      const result = await this.roles.listRoles().toPromise();

      if (result) {
        console.log('Dentro del result de roles.');
        this.rolesValueList = result.map((role) => role.Code);
        this.rolesLabelList = result.map((role) => role.RolesDescription);
        console.log(this.rolesValueList);
        console.log(this.rolesLabelList);
      } else {
        console.error('La respuesta de roles es undefined.');
      }
    } catch (error) {
      console.error('Error al obtener roles:', error);
    }
  }

  async getLicences() {
    console.log('Voy a buscar las licencias al back');
    try {
      const result = await this.licences.listLicences().toPromise();

      if (result) {
        console.log('Dentro del result de licencias.');
        this.licencesValueList = result.map((licence) => licence.Category);
        this.licencesLabelList = result.map((licence) => licence.Category);
        console.log(this.licencesValueList);
        console.log(this.licencesLabelList);
      } else {
        console.error('La respuesta de licencias es undefined.');
      }
    } catch (error) {
      console.error('Error al obtener licencias:', error);
    }
  }

  refreshMethod() {
    this.empService.listEmployees().subscribe(
      (result) => {
        if (result != null) {
          this.dataSource.data = result;
          this.columns = this.getTableColumns();
          this.resultsLength = result.length;
          this.dataLoaded = true;

        // Testear
        this.isEmpty = this.dataSource.data.length === 0;
        }
        else
        this.showSnackBar('Ocurrio un error al mostrar los empleados.');
      },
      (error) => { this.showSnackBar(error); }
    );
  }

  getTableColumns(): TableColumn[] {
    return [
      { header: 'Cedula', field: 'ID', type: 'text' },
      { header: 'Nombre', field: 'EmpName', type: 'text' },
      { header: 'Apellido', field: 'EmpLastName', type: 'text' },
      { header: 'F. nacimiento', field: 'DateOfBirth', type: 'date' },
      { header: 'Celular', field: 'Celphone', type: 'text' },
      { header: 'Direccion', field: 'EmpAddress', type: 'text' },
      { header: 'Rol', field: 'EmpRole', type: 'select' },
      { header: 'Licencia', field: 'Licence', type: 'select' },
      { header: ' ', field: 'delete', type: 'button', color: 'mat-warn', icon: 'delete', action: (item) => this.deleteEmp(item.ID) },
      { header: '  ', field: 'edit', type: 'button', color: 'mat-primary', icon: 'edit_square', action: (item) => this.openDialogToModify(item) }
    ];
  };

  getFormFields(): SharedInput[] {
    return [
      { field: 'ID',label: 'Cedula', type: 'number', formControlName: 'ID' },
      { field: 'EmpUser', label: 'Usuario', type: 'text', formControlName: 'EmpUser' },
      { field: 'EmpPassword', label: 'Contraseña', type: 'text', formControlName: 'EmpPassword' },
      { field: 'EmpName', label: 'Nombre', type: 'text', formControlName: 'EmpName' },
      { field: 'EmpLastName', label: 'Apellido', type: 'text', formControlName: 'EmpLastName' },
      { field: 'DateOfBirth', label: 'F. nacimiento', type: 'date', formControlName: 'DateOfBirth' },
      { field: 'Celphone', label: 'Celular', type: 'number', formControlName: 'Celphone' },
      { field: 'EmpAddress', label: 'Direccion', type: 'text', formControlName: 'EmpAddress' },
      { field: 'EmpRole', label: 'Rol', type: 'select', formControlName: 'EmpRole', optionsValue: this.rolesValueList, optionsLabel: this.rolesLabelList },
      { field: 'Licence', label: 'Licencia', type: 'select', formControlName: 'Licence', optionsValue: this.licencesValueList, optionsLabel: this.licencesLabelList},
    ];
  };

  showSnackBar( message: string ): void {
    this.snackBar.open( message, 'cerrar', {
      duration: 4000,
    })
  }

  deleteEmp(emp: number) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { //DialogOverviewExampleDialog es el componente para mostrar la confirmacion.
      data: "Este empleado se eliminara permanentemente ¿Esta seguro que desea continuar?"
    });

    dialogRef.afterClosed()
    .subscribe(
    (confirmado: boolean) => {
      if(confirmado){
      this.empService.deleteEmployee(emp).subscribe(
        (result) => {
          this.showSnackBar('El empleado se elimino satisfactoriamente.')
          this.refreshMethod();
        },
        (error) => {
          this.showSnackBar(error);
        }
      );
    }
    });
  }

  openDialog() {

    console.log('abriendo mat dialog')
    const dialogo1 = this.dialog.open(SharedFormComponent, { //Abro la instancia de el formulario creado con un Matdialog

      data: {
        form: this.myForm, //Obtengo los validadores.
        formFields: this.getFormFields(), //Obtengo los campos de el formulario.
      },
      disableClose: true, //Desactivo que el formulario se pueda cerrar al presionar fuera.
    });

    //En el caso que se haya desabilitado anteriormente lo habilito.
    dialogo1.afterOpened().subscribe(() => {
      const IDControl = dialogo1.componentInstance.myForm.get('ID');
      IDControl?.enable();
    });

    //Me subscribo al evento onSubmit del formulario.
    dialogo1.componentInstance.formSubmit
      .subscribe((formValues: any) => {

        //Crear una objeto con los valores del formulario reutilizable.
      const e: Employee = {
        ID: formValues.ID,
        EmpUser: formValues.EmpUser,
        EmpPassword: formValues.EmpPassword,
        EmpName: formValues.EmpName,
        EmpLastName: formValues.EmpLastName,
        DateOfBirth: formValues.DateOfBirth,
        Celphone: formValues.Celphone,
        EmpAddress: formValues.EmpAddress,
        EmpRole: formValues.EmpRole,
        Licence: formValues.Licence,
      };

      //Metodo Para agregar
      this.empService.addEmployee( e ).subscribe(
        (response) => {
        this.showSnackBar(`El empleado fue agregado satisfactoriamente`);
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

      // const idControl = dialogo1.componentInstance.myForm.get('ID');
      // const nameControl = dialogo1.componentInstance.myForm.get('EmpName');
      // const lastnameControl = dialogo1.componentInstance.myForm.get('EmpLastName');
      // const dateOfirthControl = dialogo1.componentInstance.myForm.get('DateOfBirth');
      // const userControl = dialogo1.componentInstance.myForm.get('EmpUser');
      // const passwordControl = dialogo1.componentInstance.myForm.get('EmpPassword');
      // const celphoneControl = dialogo1.componentInstance.myForm.get('Celphone');
      // const addressControl = dialogo1.componentInstance.myForm.get('EmpAddress');
      // const roleControl = dialogo1.componentInstance.myForm.get('EmpRole');
      // const licenceControl = dialogo1.componentInstance.myForm.get('Licence');

      const controlsToSet = [
        { controlName: 'ID', value: item.ID, disable: true },
        { controlName: 'EmpName', value: item.EmpName },
        { controlName: 'EmpLastName', value: item.EmpLastName },
        { controlName: 'DateOfBirth', value: item.DateOfBirth },
        { controlName: 'EmpUser', value: item.EmpUser },
        { controlName: 'EmpPassword', value: item.EmpPassword },
        { controlName: 'Celphone', value: item.Celphone },
        { controlName: 'EmpAddress', value: item.EmpAddress },
        { controlName: 'EmpRole', value: item.EmpRole },
        { controlName: 'Licence', value: item.Licence }
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
      const Emp: Employee = {
        ID           : item.ID,
        EmpName      : formValues.EmpName,
        EmpLastName  : formValues.EmpLastName,
        DateOfBirth  : formValues.DateOfBirth,
        EmpUser      : formValues.EmpUser,
        EmpPassword  : formValues.EmpPassword,
        Celphone     : formValues.Celphone,
        EmpAddress   : formValues.EmpAddress,
        EmpRole      : formValues.EmpRole,
        Licence      : formValues.Licence,
      };

      //Metodo Para modificar una licencia
      this.empService.modifyEmployee( Emp ).subscribe(
        (response) => {
        this.showSnackBar(`El empleado fue modificado satisfactoriamente`);
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
