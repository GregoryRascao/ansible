import {PluginFormDefinition, PluginFormValidator} from '@core/src/app/features/plugins/models/plugin-form';
import {AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators} from '@angular/forms';
import {CustomValidator} from '@shared/utils/form/custom.validator';

export class PluginFormTool {

  static generateFormValidators(fValidators: PluginFormValidator[]) {
    const validators = [] as ValidatorFn[]


    const tValidators = Validators as any
    const tCustomValidator = CustomValidator as any

    for (const fValidator of fValidators) {
      const validatorFn = tValidators[fValidator.name] as any;
      const customValidatorFn = tCustomValidator[fValidator.name] as any;

      if (validatorFn && fValidator.params) {
        validators.push(validatorFn(fValidator.params))
      } else if (customValidatorFn && fValidator.params) {
        validators.push(customValidatorFn(fValidator.params))
      } else if (validatorFn) {
        validators.push(validatorFn)
      } else if (customValidatorFn) {
        validators.push(customValidatorFn)
      } else {
        console.warn(`Validator ${fValidator.name} not found`)
      }
    }

    return validators;
  }

  static generateFormFields(fields: any[]) {
    const fieldsMap: { [key: string]: AbstractControl } = {};

    for (const field of fields) {
      if (field.controlType === 'group') {
        const formGroup = new FormGroup(
          this.generateFormFields(field.fields),
          {
            validators: this.generateFormValidators(field.validators || [])
          }
        )
        if (field.defaultValue) {
          formGroup.patchValue(field.defaultValue)
        }
        fieldsMap[field.name] = formGroup
      } else if (field.controlType === 'array') {
        const formArray = new FormArray([] as FormGroup[], {validators: this.generateFormValidators(field.validators || [])})

        if (field.defaultValue) {
          for (const value of field.defaultValue) {
            const formGroup = new FormGroup(
              this.generateFormFields(field.group.fields),
              {
                validators: this.generateFormValidators(field.group.validators || [])
              }
            )
            formGroup.patchValue(value)
            formArray.push(formGroup)
          }
        }
        fieldsMap[field.name] = formArray
      } else {
        fieldsMap[field.name] = new FormControl(
          field.defaultValue || null,
          {
            nonNullable: field.optional,
            validators: this.generateFormValidators(field.validators || [])
          }
        )
      }
    }

    return fieldsMap
  }

  static generateForm(form: PluginFormDefinition) {
    const formGroupValidators = this.generateFormValidators(form.validators || [])
    const formGroupFields = this.generateFormFields(form.fields);

    return new FormGroup(formGroupFields, {validators: formGroupValidators});
  }


}
