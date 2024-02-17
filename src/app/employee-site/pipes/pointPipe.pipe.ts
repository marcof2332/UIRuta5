import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'pointPipe'})
export class pointPipe implements PipeTransform {
  transform(value: number): string {
    return String.fromCharCode(value + 65) + ' -> ' + String.fromCharCode(value + 66);
  }
}
