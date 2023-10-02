import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, CanMatch, Route, Router, RouterStateSnapshot, UrlSegment, UrlTree } from "@angular/router";
import { ValidatorUserService } from "../public-site/services/validator-user.service";
import { Observable, map, tap } from "rxjs";



@Injectable({providedIn: 'root'})
export class publicGuardCheck implements CanActivate, CanMatch {

  constructor(
    private authService: ValidatorUserService,
    private router: Router
    ) { }

  canMatch(route: Route, segments: UrlSegment[]): boolean | UrlTree | Observable<boolean | UrlTree> | Promise<boolean | UrlTree> {
    throw new Error("Method not implemented.");
  }

  private checkAuthStatus(): Observable<boolean> {

    console.log('Verifico que el usuario este logueado correctamente en el sistema.');
    return this.authService.autenticationVerification()
    .pipe(
      tap( isAuthenticated => console.log('Authenticated:', isAuthenticated)),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          this.router.navigate(['/public-site']);
        }
        return isAuthenticated; // Devuelve true si está autenticado, false si no lo está
      })
    );
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean | Observable<boolean> {
    console.log('Entrando en el sitio privado de empleado.');
    return this.checkAuthStatus();
  }

}

// .pipe(
//   tap( isAuthenticated => console.log('Authenticated:', isAuthenticated)),
//   tap( isAuthenticated => {
//     const userDataStr = sessionStorage.getItem('userData');
//     if (userDataStr) {
//       const userData = JSON.parse(userDataStr);
//     if( isAuthenticated && userData.role == 'GER' ) { //Para hacer el routeo de los empleados
//       this.router.navigate(['/employee-site']);
//     }
//   }
// }),
