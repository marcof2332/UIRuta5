import { Component, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTable, MatTableDataSource } from '@angular/material/table';
//Service
import { ValidatorsService } from '../../services/validators.service';
import { ZoneService } from '../../services/zone.service';
//Interface
import { Zone } from 'src/app/Interfaces/zone.interface';
import { TableColumn } from '../../components/component-interfaces/TableColumn.interface';
//Component
import { SharedTableComponent } from '../../components/shared-table/shared-table.component';
import { SharedFormComponent } from '../../components/shared-form/shared-form.component';
import { SharedInput } from '../../components/component-interfaces/shared-input.interface';
import { CitiesService } from '../../services/cities.service';
import { City } from 'src/app/Interfaces/cities.interface';
import { MatSelectChange } from '@angular/material/select';
import { SharedZoneMapComponent } from '../../components/shared-zone-map/shared-zone-map.component';
import { take } from 'rxjs';
import { SharedmapdataService } from '../../services/sharedmapdata.service';
import { ZoneFormComponent } from '../../components/zone-form/zone-form.component';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'zone-mng',
  templateUrl: './zones.component.html',
  styleUrls: ['./zones.component.css']
})
export class ZonesComponent {

  constructor(
    private zServ: ZoneService,
    private fb: FormBuilder, //importo un servicio para que me ayude a crear dinamicamente la form.
    private dialog: MatDialog, //Me permite crear un dialog, que voy a utilizar a la hora de eliminar
    private snackBar: MatSnackBar,
    private cService: CitiesService,
    private chMap: SharedmapdataService
    ) { }

  //Table
  columns: TableColumn[] = [];
  dataSource: MatTableDataSource<Zone> = new MatTableDataSource();
  filteredlist: MatTableDataSource<Zone> = new MatTableDataSource();
  cities: City[] = [];

  @ViewChild(MatTable) table!: SharedTableComponent;
  @ViewChild(SharedFormComponent) form!: SharedFormComponent;
  resultsLength: number = 0;
  dataLoaded = false;
  isEmpty!: boolean;

  //Select
  cityValueList: number[] = [];
  cityLabelList: string[] = [];
  selectedCityId: number | null = null; // Variable para la ciudad seleccionada

  getTableColumns(): TableColumn[] {
    return [
      { header: 'Identificador', field: 'IdZone', type: 'text' },
      { header: 'Nombre', field: 'ZoneName', type: 'text' },
      { header: 'Ciudad', field: 'CityName', type: 'text' },
      { header: ' ', field: 'search', type: 'button', color: 'mat-primary', icon: 'search', action: (item) => this.openDialogToMap(item) },
      { header: '  ', field: 'delete', type: 'button', color: 'mat-warn', icon: 'delete', action: (item) => this.deleteZone(item.IdZone) },
    ];
  };

  //Form
  public myForm: FormGroup = this.fb.group({
    // las 3 partes de esta validacion es '' = valor inicial, [] = validador sincronos y [] = validadores asincronos o sea name: ['', [], []]
    IdZone: [''],
    ZoneName: ['', [Validators.required, Validators.minLength(3) ]],
    City: ['', [Validators.required ]],
    ZoneShape: [''],
  });

  async getCities() {
    try {
      const result = await this.cService.listCities().toPromise();

      if (result) {
        this.cities = result;
        this.cityValueList = result.map((city) => city.IdCity);
        this.cityLabelList = result.map((city) => city.CityName);
      } else {
        console.error('Ocurrio un error al buscar las ciudades.');
      }
    } catch (error) {
      console.error('Error al obtener los ciudades:', error);
    }
  }

  async refreshMethod() {
    this.zServ.listZone().subscribe(
      (result) => {
        if (result != null) {
          this.dataSource.data = result;
          this.filteredlist.data = this.dataSource.data.slice(); // Inicializa filteredData

          this.filteredlist.data = result.map((zone) => {
            const city = this.cities.find((c) => c.IdCity === zone.City);
            return { ...zone, CityName: city ? city.CityName : 'test' };
          });

          this.columns = this.getTableColumns();
          this.resultsLength = result.length;
          this.dataLoaded = true;

          // Testear
          this.isEmpty = this.dataSource.data.length === 0;
        } else {
          this.showSnackBar('Ocurrio un error al mostrar las zonas.');
        }
      },
      (error) => {
        this.showSnackBar(error);
      }
    );
  }

  onStateSelectionChange(event: MatSelectChange) {
    this.selectedCityId = event.value;
    if (this.selectedCityId === -1) {
      //Mostrar todos los datos originales
      this.filteredlist.data = this.dataSource.data.map((zone) => {
        const city = this.cities.find((c) => c.IdCity === zone.City);
        return { ...zone, CityName: city ? city.CityName : 'test' };
      });
    } else if (this.selectedCityId) {
      // Filtrar los datos según el IdState seleccionado y agregar nombres de estados
      this.filteredlist.data = this.dataSource.data
        .filter(zone => zone.City === this.selectedCityId)
        .map((zone) => {
          const city = this.cities.find((c) => c.IdCity === zone.City);
          return { ...zone, CityName: city ? city.CityName : 'test' };
        });
    }
    // Actualiza la longitud de los resultados
    this.resultsLength = this.filteredlist.data.length;
  }

  async ngOnInit() {
    await this.getCities();
    await this.refreshMethod();
  }

  //Metodo para mostrar un snackbar con un mensaje
  showSnackBar( message: string ): void {
    this.snackBar.open( message, 'cerrar', {
      duration: 4000,
    })
  };

  openDialogToMap(item: any) {

    const dialogo1 = this.dialog.open(SharedZoneMapComponent, { //Abro la instancia de el formulario creado con un Matdialog
      data: {
        Zone: item, // Pasa el objeto item como parte de los datos
      },
    });
  }

  openDialogToAdd() {
    const dialogo1 = this.dialog.open(ZoneFormComponent, { //Abro la instancia de el formulario creado con un Matdialog
      data: {
        form: this.myForm, //Obtengo los validadores.
        cityValueList: this.cityValueList,
        cityLabelList: this.cityLabelList,
      },
      disableClose: true, //Desactivo que el formulario se pueda cerrar al presionar fuera.
    });

    //Me subscribo al evento onSubmit del formulario.
    dialogo1.componentInstance.formSubmit
    .pipe(
      take(1)) // Limita la suscripción a un único evento
      .subscribe((formValues: any) => {

        console.log(formValues.ZoneShape)
        const checkZoneShape = this.chMap.convertLatLngLiteralToGeoPolygon(formValues.ZoneShape);
        console.log(checkZoneShape);

        if(checkZoneShape)
        {
           const z: Zone = {
            IdZone: 0,
            ZoneName: formValues.ZoneName,
            City: formValues.City,
            //ZoneShape: checkZoneShape,
            WellKnownValue: checkZoneShape.WellKnownValue,
            CoordinateSystemId: checkZoneShape.CoordinateSystemId,
            BranchOffices: undefined,
          };

          console.log(z);
          //Metodo Para agregar una licencia
          this.zServ.addZone( z ).subscribe(
            (response) => {
            this.showSnackBar(`La zona fue agregada satisfactoriamente`);
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
      }
  });
    dialogo1.afterClosed()
    .subscribe((result: boolean) => {
      if (result === true) {
        this.refreshMethod();
      }
    });
  }

  deleteZone(id: number) {
    console.log(id);

    const dialogRef = this.dialog.open(ConfirmDialogComponent, { //DialogOverviewExampleDialog es el componente para mostrar la confirmacion.
      data: "La zona se eliminara permanentemente ¿Esta seguro que desea continuar?"
    });

    dialogRef.afterClosed()
    .subscribe(
    (confirmado: boolean) => {
      if(confirmado){
      this.zServ.deleteZone(id).subscribe(
        (result) => {
          this.showSnackBar('La zona se elimino satisfactoriamente!')
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
