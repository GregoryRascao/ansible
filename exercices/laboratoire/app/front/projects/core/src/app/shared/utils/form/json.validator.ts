import {AbstractControl, ValidatorFn} from '@angular/forms';

export const json: ValidatorFn = function (control: AbstractControl) {
  try {
    const json = JSON.parse(control.value)
    return json == null ? {json: 'Input is not a valid JSON'} : null;
  } catch (e) {
    return {json: 'Input is not a valid JSON'}
  }
}
