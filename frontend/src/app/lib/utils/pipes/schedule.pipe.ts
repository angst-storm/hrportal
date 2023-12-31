import { Pipe, PipeTransform } from '@angular/core';
import { Schedule, ScheduleRussian } from '../enums';

@Pipe({
    name: 'schedule'
})
export class SchedulePipe implements PipeTransform {
    public transform(value: Schedule, ...args: unknown[]): string {
        return ScheduleRussian[value];
    }
}
