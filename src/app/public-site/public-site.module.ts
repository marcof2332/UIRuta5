import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PublicSiteRoutingModule } from './public-site-routing.module';
import { LayoutPageComponent } from './pages/layout-page/layout-page.component';
import { MaterialModule } from '../material/material.module';
import { AuthComponent } from './auth/auth.component';
import { ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    LayoutPageComponent,
    AuthComponent
  ],
  imports: [
    CommonModule,
    PublicSiteRoutingModule,
    MaterialModule,
    ReactiveFormsModule
  ]
})
export class PublicSiteModule { }
