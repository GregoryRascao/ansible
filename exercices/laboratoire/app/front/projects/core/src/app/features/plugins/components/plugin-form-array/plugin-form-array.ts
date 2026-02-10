import {Component, forwardRef, input} from '@angular/core';
import {FormArray, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {PluginFormFieldDefinition} from '@features/plugins/models/plugin-form';
import {Button} from 'primeng/button';
import {PluginFormGroup} from '@features/plugins/components/plugin-form-group/plugin-form-group';
import {PluginFormTool} from '@features/plugins/tools/plugin-form-tool';
import {TranslatePipe} from '@ngx-translate/core';

@Component({
  selector: 'plugin-form-array',
  imports: [
    ReactiveFormsModule,
    Button,
    forwardRef(() => PluginFormGroup),
    TranslatePipe
  ],
  templateUrl: './plugin-form-array.html',
  styleUrl: './plugin-form-array.css'
})
export class PluginFormArray {
  array = input.required<FormArray>()
  arrayDef = input.required<PluginFormFieldDefinition>()

  getGroup(index: number) {
    const form = this.array().at(index) as FormGroup;
    return form
  }


  addItem(fieldDef: PluginFormFieldDefinition) {
    const array = this.array()
    if (fieldDef.group) {
      const newForm = PluginFormTool.generateFormFields(fieldDef.group.fields)
      const group = new FormGroup(newForm, {validators: PluginFormTool.generateFormValidators(fieldDef.group.validators || [])})

      array.push(group)
    }
  }

  removeItem(index: number) {
    const array = this.array()
    array.removeAt(index)
  }
}
