import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { PackageType } from 'src/app/Interfaces/package-type.interface';
import { Package } from 'src/app/Interfaces/package.interface';
import { TableColumn } from 'src/app/employee-site/components/component-interfaces/TableColumn.interface';
import { PackageTypesService } from 'src/app/employee-site/services/package-types.service';
import { PackagesService } from 'src/app/employee-site/services/packages.service';

@Component({
  selector: 'app-shippment-stages',
  templateUrl: './shippment-stages.component.html',
  styleUrls: ['./shippment-stages.component.css']
})
export class ShippmentStagesComponent implements OnInit {

  @Input() shippmentId: number;
  @Output() packagesSelected: EventEmitter<Package[]> = new EventEmitter<Package[]>();

  columns: TableColumn[] = [];
  packageTypes: PackageType[]
  isCardOpen: boolean = false;
  isLoading: boolean = false;
  selectedPackages: Package[] = [];
  dataSource = new MatTableDataSource<{type: string, number: number}>();

  constructor(private snackBar: MatSnackBar,
              private packagesTypesService: PackageTypesService,
              private fb: FormBuilder,
              private packageService: PackagesService) { }

  async ngOnInit() {
    await this.getPackageTypes();
    this.columns = this.getTableColumns();
  }

  packagesForm: FormGroup = this.fb.group({
    packagesTypes: ['', Validators.required],
    packagesNumber: ['', Validators.required]
  });
  
  getTableColumns(): TableColumn[] {
    return [
      { header: 'Tipo de paquete', field: 'type', type: 'text' },
      { header: 'Cantidad de paquetes', field: 'number', type: 'text' }
    ];
  };

  async getPackageTypes(){
    this.isLoading = true;
    const result = await this.packagesTypesService.listPType().toPromise();
    if (result) {
      this.packageTypes = result;
      this.isLoading = false;
    } else {
      this.showSnackBar('Ocurrio un error al buscar los tipos de paquete.');
      this.isLoading = false;
    }
  }

  showSnackBar(message: string): void {
    this.snackBar.open(message, 'cerrar', {
      duration: 4000,
    })
  }

  toggleCard() {
    this.isCardOpen = !this.isCardOpen;
  }

  async submitForm() {
    if (this.packagesForm.valid) {
      const newPackage: Package = {
        Shippment: this.shippmentId,
        PType: this.packagesForm.get('packagesTypes').value,
        NOfPackages: this.packagesForm.get('packagesNumber').value
      }
      this.selectedPackages.push(newPackage);
      this.dataSource.data.push({
          type: this.packageTypes.find(pt => pt.IdPackageType === newPackage.PType).TypeDescription,
          number: newPackage.NOfPackages
      });
      this.dataSource.data = this.dataSource.data.slice();
      this.packagesSelected.emit(this.selectedPackages);
      this.toggleCard();
    } else {
      this.showSnackBar('Complete todos los datos del formulario.')
    }
  }

  //AGREGAR AL ARRAY CADA REGISTRO
  //HACER UN OUTPUT DE LA INFO DE LOS PAQUETES
  //FIJARNOS COMO HACEMOS PARA HACER UN UNICO LLAMADO MANDANDO TODOS LOS PAQUETES.
}