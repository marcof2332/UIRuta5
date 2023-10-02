import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AuthComponent } from '../../auth/auth.component';
import { filter, switchMap } from 'rxjs';
import { ValidatorUserService } from '../../services/validator-user.service';

@Component({
  selector: 'layout-page',
  templateUrl: './layout-page.component.html',
  styleUrls: ['./layout-page.component.css']
})
export class LayoutPageComponent {

  constructor(
    private dialog: MatDialog, //Me permite crear un pop up, que voy a utilizar a la hora de eliminar
  ) {}

  openDialog() {
    const dialogo1 = this.dialog.open(AuthComponent, {
    });
  }

}
