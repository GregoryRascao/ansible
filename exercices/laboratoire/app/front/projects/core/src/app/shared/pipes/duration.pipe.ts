import { Pipe, PipeTransform } from '@angular/core';
import {Duration} from "date-fns";

@Pipe({
    name: 'duration',
    standalone: true
})
export class DurationPipe implements PipeTransform {

  transform(value: Duration, opts: Partial<{hours: string, minutes: string, seconds: string}> = { hours: 'h', minutes: 'min', seconds: 'sec'}): string {
    let h;
    let m;
    let s;
    if (!value.hours) h = 0;
    else h = value.hours && value.hours < 10 ? `0${value.hours}` : `${value.hours}`

    if (!value.minutes) m = 0;
    else m = value.minutes && value.minutes < 10 ? `0${value.minutes}` : `${value.minutes}`

    if (!value.seconds) s = 0
    else s = value.seconds && value.seconds < 10 ? `0${value.seconds}` : `${value.seconds}`
    return `${h || 0}${opts.hours}${m || 0}${opts.minutes}${s || 0}${opts.seconds}`;
  }

}
