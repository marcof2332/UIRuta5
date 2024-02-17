import { Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource, MatTableDataSourcePaginator } from '@angular/material/table';
import { take } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
//Components
import { SharedTableComponent } from 'src/app/employee-site/components/shared-table/shared-table.component';
import { SharedInput } from 'src/app/employee-site/components/component-interfaces/shared-input.interface';
import { SharedFormComponent } from 'src/app/employee-site/components/shared-form/shared-form.component';
import { ConfirmDialogComponent } from 'src/app/employee-site/components/confirm-dialog/confirm-dialog.component';
//Services
import { ValidatorsService } from 'src/app/employee-site/services/validators.service';
import { LicencesService } from 'src/app/employee-site/services/licences.service';
//Interfaces
import { TableColumn } from 'src/app/employee-site/components/component-interfaces/TableColumn.interface';
import { Licence } from 'src/app/Interfaces/licence.interface';

@Component({
  selector: 'li-mng',
  templateUrl: './manage-licence.component.html',
  styleUrls: ['./manage-licence.component.css']
})
export class ManageLicenceComponent {

  constructor(
    private licenceService: LicencesService,
    private fb: FormBuilder, //importo un servicio para que me ayude a crear dinamicamente la form.
    private dialog: MatDialog, //Me permite crear un dialog, que voy a utilizar a la hora de eliminar
    private snackBar: MatSnackBar,
    private validatorsService: ValidatorsService,
    ) { }

  //Table
  columns: TableColumn[] = [];
  dataSource: MatTableDataSource<Licence> = new MatTableDataSource();
  @ViewChild(MatTable) table!: SharedTableComponent;
  @ViewChild(SharedFormComponent) form!: SharedFormComponent;
  resultsLength: number = 0;
  dataLoaded = false;
  isEmpty!: boolean;

  getTableColumns(): TableColumn[] {
    return [
      { header: 'Categoria', field: 'Category', type: 'text' },
      { header: 'Capacidad', field: 'Capacity', type: 'text' },
      { header: 'Descripcion', field: 'LicenceDescription', type: 'text' },
      { header: ' ', field: 'delete', type: 'button', color: 'mat-warn', icon: 'delete', action: (item) => this.deleteLicence(item.Category) },
      { header: '  ', field: 'edit', type: 'button', color: 'mat-primary', icon: 'edit_square', action: (item) => this.openDialogToModify(item) }
    ];
  };

  //Form
  public myForm: FormGroup = this.fb.group({
    // las 3 partes de esta validacion es '' = valor inicial, [] = validador sincronos y [] = validadores asincronos o sea name: ['', [], []]
    category: ['', [Validators.required, Validators.pattern(this.validatorsService.licencePattern) ]],
    capacity: ['', [Validators.required, Validators.pattern(this.validatorsService.capacityPattern)]],
    licencedescription: ['', [Validators.required, ]],
  });

  getFormFields(): SharedInput[] {
    return [
      { field: 'Category',label: 'Categoria', type: 'text', formControlName: 'category' },
      { field: 'Capacity', label: 'Capacidad', type: 'number', formControlName: 'capacity' },
      { field: 'LicenceDescription', label: 'Descripcion', type: 'text', formControlName: 'licencedescription' },
    ];
  };

  ngOnInit(): void {
    this.refreshMethod();
  }

  refreshMethod() {

    this.licenceService.listLicences().subscribe(
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
        this.showSnackBar('Ocurrio un error al mostrar las licencias.');
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

    //Me subscribo al evento onSubmit del formulario.
    dialogo1.componentInstance.formSubmit
    .pipe(
      take(1)) // Limita la suscripción a un único evento
      .subscribe((formValues: any) => {

        //Crear una objeto con los valores del formulario reutilizable.
      const li: Licence = {
        Category: formValues.category,
        Capacity: formValues.capacity,
        LicenceDescription: formValues.licencedescription
      };

      //Metodo Para agregar una licencia
      this.licenceService.addLicence( li ).subscribe(
        (response) => {
        this.showSnackBar(`La licencia fue agregada satisfactoriamente`);
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

      const categoryControl = dialogo1.componentInstance.myForm.get('category');
      const capacityControl = dialogo1.componentInstance.myForm.get('capacity');
      const licencedescriptionControl = dialogo1.componentInstance.myForm.get('licencedescription');

      if (categoryControl && capacityControl && licencedescriptionControl) {
        // Asigna los valores del objeto 'item' a los controles correspondientes
        categoryControl.setValue(item.Category);
        categoryControl.disable();
        capacityControl.setValue(item.Capacity);
        licencedescriptionControl.setValue(item.LicenceDescription);
      }
    });

    //Me subscribo al evento onSubmit del formulario.
    dialogo1.componentInstance.formSubmit
    .pipe(
      take(1)) // Limita la suscripción a un único evento
      .subscribe((formValues: any) => {

        //Crear una objeto con los valores del formulario reutilizable.
      const li: Licence = {
        Category: item.Category,
        Capacity: formValues.capacity,
        LicenceDescription: formValues.licencedescription
      };

      //Metodo Para modificar una licencia
      this.licenceService.modifyLicence( li ).subscribe(
        (response) => {
        this.showSnackBar(`La licencia fue modificada satisfactoriamente`);
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

  deleteLicence(cat: string) {
    console.log(cat);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, { //DialogOverviewExampleDialog es el componente para mostrar la confirmacion.
      data: "Esta licencia se eliminara permanentemente ¿Esta seguro que desea continuar?"
    });

    dialogRef.afterClosed()
    .subscribe(
    (confirmado: boolean) => {
      if(confirmado){
      this.licenceService.deleteLicence(cat).subscribe(
        (result) => {
          this.showSnackBar('La licencia se elimino satisfactoriamente!')
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
