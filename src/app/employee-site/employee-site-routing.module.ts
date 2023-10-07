import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { ManageLicenceComponent } from './pages/Licences/manage-licence.component';
import { RoleManagementComponent } from './pages/Roles/role-management.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { StatesComponent } from './pages/states/states.component';
import { CitiesComponent } from './pages/cities/cities.component';
import { VehicleConditionComponent } from './pages/vehicle-condition/vehicle-condition.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent, //layout page donde se van a montar todos los hijos en esta carpeta
    children: [
      { path: 'li-mng', component: ManageLicenceComponent },
      { path: 'role-mng', component: RoleManagementComponent },
      { path: 'emp-mng', component: EmployeesComponent },
      { path: 'st-mng', component: StatesComponent },
      { path: 'city-mng', component: CitiesComponent },
      { path: 'vst-mng', component: VehicleConditionComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeSiteRoutingModule { }
