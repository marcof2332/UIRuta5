import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { ManageLicenceComponent } from './pages/Licences/manage-licence.component';
import { RoleManagementComponent } from './pages/Roles/role-management.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { StatesComponent } from './pages/states/states.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutPageComponent, //layout page donde se van a montar todos los hijos en esta carpeta
    children: [
      { path: 'li-mng', component: ManageLicenceComponent },
      { path: 'role-mng', component: RoleManagementComponent },
      { path: 'emp-mng', component: EmployeesComponent },
      { path: 'st-mng', component: StatesComponent },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeSiteRoutingModule { }
