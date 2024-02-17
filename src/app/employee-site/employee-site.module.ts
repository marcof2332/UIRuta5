import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeSiteRoutingModule } from './employee-site-routing.module';
import { MaterialModule } from '../material/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';
import { SharedTableComponent } from './components/shared-table/shared-table.component';
import { ManageLicenceComponent } from './pages/Licences/manage-licence.component';
import { RoleManagementComponent } from './pages/Roles/role-management.component';
import { SharedFormComponent } from './components/shared-form/shared-form.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import { CustomDatePipePipe } from './pipes/custom-date-pipe.pipe';
import { StatesComponent } from './pages/states/states.component';
import { CitiesComponent } from './pages/cities/cities.component';
import { VehicleConditionComponent } from './pages/vehicle-condition/vehicle-condition.component';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { PackageTypeComponent } from './pages/package-type/package-type.component';
import { CustomerComponent } from './pages/customer/customer.component';
import { SharedMapComponent } from './components/shared-route-map/shared-route-map.component';
import { CustomerFormComponent } from './components/customer-form/customer-form.component';
import { GoogleMapsModule } from '@angular/google-maps';
import { pointPipe } from './pipes/pointPipe.pipe';
import { TestMapComponent } from './pages/test-map/test-map.component';
import { SharedSimpleMapComponent } from './components/shared-simple-map/shared-simple-map.component';
import { SharedZoneMapComponent } from './components/shared-zone-map/shared-zone-map.component';
import { ZonesComponent } from './pages/zones/zones.component';
import { ZoneFormComponent } from './components/zone-form/zone-form.component';
import { BranchOfficeComponent } from './pages/branch-office/branch-office.component';
import { OfficeFormComponent } from './components/office-form/office-form.component';
import { ShippmentListComponent } from './pages/shippment/shippment-list/shippment-list.component';
import { ShippmentOrderComponent } from './pages/shippment/shippment-order/shippment-order.component';
import { ShippmentStagesComponent } from './pages/shippment/shippment-order/shippment-stages/shippment-stages.component';
import { StagesComponent } from './pages/stages/stages.component';
import { ShippmentDetailsComponent } from './components/shippment-details/shippment-details.component';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'YYYY-MM-DD',
  },
  display: {
    dateInput: 'YYYY-MM-DD',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM-YYYY',
  },
};

@NgModule({
  declarations: [
    LayoutPageComponent,
    ManageLicenceComponent,
    ConfirmDialogComponent,
    SharedTableComponent,
    RoleManagementComponent,
    SharedFormComponent,
    EmployeesComponent,
    CustomDatePipePipe,
    StatesComponent,
    CitiesComponent,
    VehicleConditionComponent,
    VehiclesComponent,
    PackageTypeComponent,
    CustomerComponent,
    SharedMapComponent,
    CustomerFormComponent,
    pointPipe,
    TestMapComponent,
    SharedSimpleMapComponent,
    SharedZoneMapComponent,
    ZonesComponent,
    ZoneFormComponent,
    BranchOfficeComponent,
    OfficeFormComponent,
    ShippmentListComponent,
    ShippmentOrderComponent,
    ShippmentStagesComponent,
    StagesComponent,
    ShippmentDetailsComponent
  ],
  imports: [
    CommonModule,
    EmployeeSiteRoutingModule,
    MaterialModule,
    ReactiveFormsModule,
    GoogleMapsModule,
    FormsModule
  ],
  providers: [
      { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
      { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  ]
})
export class EmployeeSiteModule { }
