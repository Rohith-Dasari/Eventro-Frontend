import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'minutesToHours'
})
export class MinutesToHoursPipe implements PipeTransform {

  transform(minutes:number): string {
    if (minutes === null || minutes === undefined) {
      return '';
    }
    const decimalHours = minutes / 60;
    return `${decimalHours.toFixed(1)}h`;
  }

}
