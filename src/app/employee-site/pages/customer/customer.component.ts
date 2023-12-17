import { Component, OnInit, ViewChild } from '@angular/core';
import { CustomerService } from '../../services/customer.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { take } from 'rxjs';
//Interface
import { TableColumn } from '../../components/component-interfaces/TableColumn.interface';
import { Customer } from 'src/app/Interfaces/customers.interface';
import { City } from 'src/app/Interfaces/cities.interface';
import { Zone } from 'src/app/Interfaces/zone.interface';
//Components
import { SharedTableComponent } from '../../components/shared-table/shared-table.component';
//Services
import { ValidatorsService } from '../../services/validators.service';
import { StateService } from '../../services/state.service';
import { CustomerFormComponent } from '../../components/customer-form/customer-form.component';

@Component({
  selector: 'customer-mng',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.css']
})
export class CustomerComponent implements OnInit {

  constructor(
    private customerService: CustomerService,
    private StateService: StateService,
    private fb: FormBuilder, //importo un servicio para que me ayude a crear dinamicamente la form.
    private dialog: MatDialog, //Me permite crear un dialog
    private snackBar: MatSnackBar,
    private validatorsService: ValidatorsService,
    ) { }

//Table
columns: TableColumn[] = [];
dataSource: MatTableDataSource<Customer> = new MatTableDataSource();
@ViewChild(MatTable) table!: SharedTableComponent;
@ViewChild(CustomerFormComponent) form!: CustomerFormComponent;
resultsLength: number = 0;
dataLoaded = false;
isEmpty!: boolean;

//Form
public myForm: FormGroup = this.fb.group({
  // las 3 partes de esta validacion es '' = valor inicial, [] = validador sincronos y [] = validadores asincronos o sea name: ['', [], []]
  DocRut: ['', [Validators.required, Validators.pattern(this.validatorsService.empIdPattern) || Validators.pattern(this.validatorsService.RUTPattern)  ]],
  CustomerName: ['', [Validators.required, Validators.minLength(2)]],
  CLastName: ['', [Validators.required, Validators.minLength(2)]],
  Celphone: ['', [Validators.required, Validators.pattern(this.validatorsService.celPattern) ]],
  ClientState: ['', [Validators.required, ]],
  ClientCity: ['', [Validators.required, ]],
  ClientZone: ['', [Validators.required, ]],
  CliAddress: ['', [Validators.required, Validators.minLength(2)]],
});

citiesList      : City[]   = [];
zonesList       : Zone[]   = [];
statesValueList : number[] = [];
statesLabelList : string[] = [];

async listCustomer() {
  try {
    const result = await this.customerService.listCustomer().toPromise();

    if (result != null) {
      this.dataSource.data = result;
      this.columns = this.getTableColumns();
      this.resultsLength = result.length;
      this.dataLoaded = true;

    // Testear
    this.isEmpty = this.dataSource.data.length === 0;
    }
    else
    this.showSnackBar('Ocurrio un error al mostrar los clientes.');
    }
    catch (error) {
    console.error('Error al obtener roles:', error);
  }
}

async getStates() {
  try {
    const result = await this.StateService.listStates().toPromise();

    if (result) {
      this.statesValueList = result.map((state) => state.IdState);
      this.statesLabelList = result.map((state) => state.StateName);
    } else {
      console.error('Ocurrio un error al buscar los estados.');
    }
  } catch (error) {
    console.error('Error al obtener los estados:', error);
  }
}

getTableColumns(): TableColumn[] {
  return [
    { header: 'Cedula/RUT', field: 'DocRut', type: 'text' },
    { header: 'Nombre', field: 'CustomerName', type: 'text' },
    { header: 'Apellido', field: 'CLastName', type: 'text' },
    { header: 'Celular', field: 'Celphone', type: 'text' },
    { header: 'Zona', field: 'ClientZone', type: 'text' },
    { header: 'Direccion', field: 'CliAddress', type: 'text' },
    { header: ' ', field: 'edit', type: 'button', color: 'mat-primary', icon: 'edit_square', action: (item) => this.openDialogToModify(item) }
  ];
};

// getFormFields(): SharedInput[] {
//   return [
//     { field: 'DocRut',label: 'Cedula/RUT', type: 'number', formControlName: 'DocRut' },
//     { field: 'CustomerName', label: 'Nombre', type: 'text', formControlName: 'CustomerName' },
//     { field: 'CLastName', label: 'Apellido', type: 'text', formControlName: 'CLastName' },
//     { field: 'Celphone', label: 'Celular', type: 'text', formControlName: 'Celphone' },
//     {
//       field: 'ClientState',
//       label: 'Departamento',
//       type: 'select',
//       formControlName: 'ClientState',
//       optionsValue: this.statesValueList,
//       optionsLabel: this.statesLabelList,
//       loadOptions: (selectedValue) => {
//         console.log(selectedValue);
//         this.loadCities(selectedValue);
//       },
//     },
//     { field: 'ClientCity', label: 'Ciudad', type: 'select', formControlName: 'ClientCity', optionsValue: this.citiesValueList, optionsLabel: this.citiesLabelList },
//     { field: 'ClientZone', label: 'Zona', type: 'select', formControlName: 'ClientZone', optionsValue: this.zonesValueList, optionsLabel: this.zonesLabelList },
//     { field: 'CliAddress', label: 'Direccion', type: 'text', formControlName: 'CliAddress' },
//   ];
// };

//Metodo para mostrar un snackbar con un mensaje
showSnackBar( message: string ): void {
  this.snackBar.open( message, 'cerrar', {
    duration: 4000,
  })
}

async ngOnInit() {
  await this.listCustomer();
}

async openDialogToAdd() {

  await this.getStates();

  const dialogo1 = this.dialog.open(CustomerFormComponent, { //Abro la instancia de el formulario creado con un Matdialog
    data: {
      form: this.myForm, //Obtengo los validadores.
      statesValueList: this.statesValueList,
      statesLabelList: this.statesLabelList,
    },
    disableClose: true, //Desactivo que el formulario se pueda cerrar al presionar fuera.
  });

  dialogo1.afterOpened().subscribe(() => {

    const controlsToSet = [
      { controlName: 'DocRut', hidden: false},
      { controlName: 'ClientCity', hidden: true},
      { controlName: 'ClientZone', hidden: true},
      { controlName: 'CustomerName', hidden: false },
      { controlName: 'CLastName', hidden: false },
      { controlName: 'Celphone', hidden: false },
      { controlName: 'ClientZone', hidden: false },
      { controlName: 'CliAddress', hidden: false },
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
    const c: Customer = {
      DocRut: formValues.DocRut,
      CustomerName: formValues.CustomerName,
      CLastName: formValues.CLastName,
      Celphone: formValues.Celphone,
      ClientZone: formValues.ClientZone,
      CliAddress: formValues.CliAddress,
    };

    //Metodo Para agregar una licencia
    this.customerService.addCustomer( c ).subscribe(
      (response) => {
      this.showSnackBar(`El cliente fue agregado satisfactoriamente`);
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
      this.ngOnInit();
    }
  });
}

async openDialogToModify(item: any) {

  await this.getStates();

  const dialogo1 = this.dialog.open(CustomerFormComponent, { //Abro la instancia de el formulario creado con un Matdialog
    data: {
      form: this.myForm, //Obtengo los validadores.
      statesValueList: this.statesValueList,
      statesLabelList: this.statesLabelList,
    },
    disableClose: true, //Desactivo que el formulario se pueda cerrar al presionar fuera.
  });
console.log(this.myForm)
  dialogo1.afterOpened().subscribe(() => {

    const controlsToSet = [
        { controlName: 'DocRut', value: item.DocRut, hidden: true},
        { controlName: 'ClientCity', hidden: true},
        { controlName: 'ClientZone', hidden: true},
        { controlName: 'CustomerName', value: item.CustomerName },
        { controlName: 'CLastName', value: item.CLastName },
        { controlName: 'Celphone', value: item.Celphone },
        { controlName: 'ClientZone', value: item.ClientZone },
        { controlName: 'CliAddress', value: item.CliAddress },
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
      const c: Customer = {
        DocRut: formValues.DocRut,
        CustomerName: formValues.CustomerName,
        CLastName: formValues.CLastName,
        Celphone: formValues.Celphone,
        ClientZone: formValues.ClientZone,
        CliAddress: formValues.CliAddress,
      };

    //Metodo Para modificar una licencia
    this.customerService.modifyCustomer( c ).subscribe(
      (response) => {
      this.showSnackBar(`El cliente fue modificado satisfactoriamente`);
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
      this.ngOnInit();
    }
  });
}
}
