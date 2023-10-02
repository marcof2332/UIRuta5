import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource, MatTableDataSourcePaginator } from '@angular/material/table';
import { TableColumn } from 'src/app/employee-site/components/component-interfaces/TableColumn.interface';

@Component({
  selector: 'app-shared-table',
  templateUrl: './shared-table.component.html',
  styleUrls: ['./shared-table.component.css']
})
export class SharedTableComponent implements OnInit{

  //Armado de la tabla.
  @Input() dataSource: MatTableDataSource<any> = new MatTableDataSource(); //el campo que recibe los datos para poder ser mostrados.
  @Input() columns!: TableColumn[]; //Recibo la definicion de las columnas
  displayColumns: string[] = []; //Muestro los cabezales de las columnas

  //Paginación
  @Input() resultsLength: number = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  pageSize = 5;
  pageSizeOptions: number[] = [5, 10];

  ngOnInit(): void {
    this.displayColumns = this.columns.map((tableColumn: TableColumn) => tableColumn.header);
  }

  //Necesario para la paginacion
  ngAfterViewInit() {
     this.dataSource.paginator = this.paginator;
     this.dataSource.sort = this.sort;
  }
}
