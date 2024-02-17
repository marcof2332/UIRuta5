import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { ManageLicenceComponent } from './pages/Licences/manage-licence.component';
import { RoleManagementComponent } from './pages/Roles/role-management.component';
import { EmployeesComponent } from './pages/employees/employees.component';
import { StatesComponent } from './pages/states/states.component';
import { CitiesComponent } from './pages/cities/cities.component';
import { VehicleConditionComponent } from './pages/vehicle-condition/vehicle-condition.component';
import { VehiclesComponent } from './pages/vehicles/vehicles.component';
import { PackageTypeComponent } from './pages/package-type/package-type.component';
import { CustomerComponent } from './pages/customer/customer.component';
import { SharedMapComponent } from './components/shared-route-map/shared-route-map.component';
import { TestMapComponent } from './pages/test-map/test-map.component';
import { ZonesComponent } from './pages/zones/zones.component';
import { BranchOfficeComponent } from './pages/branch-office/branch-office.component';
import { ShippmentListComponent } from './pages/shippment/shippment-list/shippment-list.component';
import { ShippmentOrderComponent } from './pages/shippment/shippment-order/shippment-order.component';
import { StagesComponent } from './pages/stages/stages.component';

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
      { path: 'vehicle-mng', component: VehiclesComponent },
      { path: 'packagety-mng', component: PackageTypeComponent },
      { path: 'customer-mng', component: CustomerComponent },
      { path: 'app-test-map', component: TestMapComponent},
      { path: 'zone-mng', component: ZonesComponent},
      { path: 'branch-mng', component: BranchOfficeComponent},
      { path: 'stages-mng', component: StagesComponent},
      { path: 'shippment-list', component: ShippmentListComponent},
      { path: 'shpp-mng', component: ShippmentOrderComponent},
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeSiteRoutingModule { }
