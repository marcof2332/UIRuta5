import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'layout-page',
  templateUrl: './layout-page.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutPageComponent {


  userRole: string = ''; // Obtener el rol del usuario aquí
  sidebarItems: any[] = []; // Aquí almacenaremos los elementos de la barra lateral

  public GERsidebarItems = [
    { label: 'Licencias', icon:'list', url: 'li-mng'},
    { label: 'Roles', icon:'manage_accounts', url: 'role-mng'},
    { label: 'Empleados', icon:'search', url: 'emp-mng'},
    { label: 'Departamentos', icon:'search', url: 'st-mng'},
    { label: 'Ciudades', icon:'search', url: 'city-mng'},
    { label: 'Zonas', icon:'search', url: 'zone-mng'},
    { label: 'Establecimientos', icon:'search', url: 'branch-mng'},
    { label: 'Vehiculos', icon:'search', children: [
      { label: 'Estados de vehiculo', icon:'search', url: 'vst-mng'},
      { label: 'Gestion de Vehiculos', icon:'search', url: 'vehicle-mng'}
    ]},
    { label: 'Gestion de paquetes', icon:'search', url: 'packagety-mng'},
    { label: 'Gestion de envíos', icon:'search', children: [
      { label: 'Estados de envío', icon:'search', url: 'shst-mng'},
      { label: 'Ingreso de envío', icon:'search', url: 'shpp-mng'},
      { label: 'Listado de envíos', icon:'search', url: 'shippment-list'},
      { label: 'Crear ruta de envío', icon:'search', url: 'shpp-rt'},
    ]},
    { label: 'Gestion de clientes', icon:'search', url: 'customer-mng'},
    { label: 'Mapa Test', icon:'search', url: 'app-test-map'},
  ]

  public ENCsidebarItems = [
    { label: 'Licencias', icon:'list', url: 'li-mng'},
    { label: 'Roles', icon:'manage_accounts', url: 'role-mng'},
    { label: 'Departamentos', icon:'search', url: 'dep-mng'},
    { label: 'Ciudades', icon:'search', url: 'city-mng'},
    { label: 'Zonas', icon:'search', url: 'zone-mng'},
    { label: 'Establecimientos', icon:'search', url: 'estab-mng'},
    { label: 'Vehiculos', icon:'search', url: 'vehicle-mng', children: [
      { label: 'Estados de vehiculo', icon:'search', url: 'vst-mng'},
      { label: 'Gestion de Vehiculos', icon:'search', url: 'vehicle-mng'}
    ]},
    { label: 'Gestion de paquetes', icon:'search', url: 'package-mng'},
    { label: 'Gestion de envíos', icon:'search', children: [
      { label: 'Estados de envío', icon:'search', url: 'shst-mng'},
      { label: 'Ingreso de envío', icon:'search', url: 'shpp-mng'},
      { label: 'Listado de envíos', icon:'search', url: 'shppmnts'},
      { label: 'Crear ruta de envío', icon:'search', url: 'shpp-rt'},
    ]},
    { label: 'Gestion de clientes', icon:'search', url: 'customer-mng'},
  ]

  public ADMsidebarItems = [
    { label: 'Gestion de envíos', icon:'search', children: [
      { label: 'Ingreso de envío', icon:'search', url: 'shpp-mng'},
      { label: 'Listado de envíos', icon:'search', url: 'shppmnts'},
    ]},
    { label: 'Gestion de clientes', icon:'search', url: 'customer-mng'},
  ]

  public CHFsidebarItems = [
    { label: 'Envios asignados', icon:'search', url: 'as-shp' },
  ]

  getRole() {
    const roleLogged = sessionStorage.getItem('userData');
    if (roleLogged) {
      const userData = JSON.parse(roleLogged);
      return this.userRole = userData.role
    }
    else {
      sessionStorage.clear;
      this.router.navigate(['/public-site']);
    }
  }

  constructor(
    private router: Router
    ){
      this.getRole();

      if (this.userRole === 'GER') {
        this.sidebarItems = this.GERsidebarItems;
      } else if (this.userRole === 'ENC') {
        this.sidebarItems = this.ENCsidebarItems;
      } else if (this.userRole === 'ADM') {
        this.sidebarItems = this.ADMsidebarItems;
      } else if (this.userRole === 'CHF') {
        this.sidebarItems = this.CHFsidebarItems;
      }
    }

    logOut() {
      localStorage.removeItem('token');
      sessionStorage.clear();
      this.router.navigate(['/public-site']);
    }
}
