import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { publicGuardCheck } from './guards/public-guard';

const isRole = (role: string) => {
  const roleLogged = sessionStorage.getItem('userData');
  if (roleLogged) {
    const userData = JSON.parse(roleLogged);
    return userData.role === role;
  }
  return roleLogged;
}

const routes: Routes = [
  {
    path: 'employee-site',
    loadChildren: () => import('./employee-site/employee-site.module').then(m => m.EmployeeSiteModule ), //como es con lazyLoad le pongo el loadchildren
    canActivate: [ publicGuardCheck ],
  },
  {
    path: 'public-site',
    loadChildren: () => import('./public-site/public-site.module').then(m => m.PublicSiteModule ), //como es con lazyLoad le pongo el loadchildren
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
