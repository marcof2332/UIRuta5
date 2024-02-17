import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'customDate'
})
export class CustomDatePipePipe implements PipeTransform {

  transform(value: any): any {
    // Formatea la fecha en el formato deseado (DD-MM-YYYY)
    return new DatePipe('en-US').transform(value, 'dd-MM-yyyy');
  }

}
