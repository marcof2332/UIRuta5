import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeSiteRoutingModule } from './employee-site-routing.module';
import { MaterialModule } from '../material/material.module';
import { ReactiveFormsModule } from '@angular/forms';

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
  ],
  imports: [
    CommonModule,
    EmployeeSiteRoutingModule,
    MaterialModule,
    ReactiveFormsModule
  ],
  providers: [
      { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
      { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
  ]
})
export class EmployeeSiteModule { }
