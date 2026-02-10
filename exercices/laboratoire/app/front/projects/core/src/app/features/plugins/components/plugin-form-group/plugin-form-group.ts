import {Component, forwardRef, input, linkedSignal} from '@angular/core';
import {PluginFormControl} from '@features/plugins/components/plugin-form-control/plugin-form-control';
import {FormArray, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {PluginFormFieldDefinition} from '@features/plugins/models/plugin-form';
import {PluginFormArray} from '@features/plugins/components/plugin-form-array/plugin-form-array';
import {Fieldset} from 'primeng/fieldset';

@Component({
  selector: 'plugin-form-group',
  imports: [
    PluginFormControl,
    ReactiveFormsModule,
    forwardRef(() => PluginFormArray),
    Fieldset
  ],
  templateUrl: './plugin-form-group.html',
  styleUrl: './plugin-form-group.css',
})
export class PluginFormGroup {
  inline = input<boolean>(false)
  group = input.required<FormGroup>()
  groupDef = input.required<PluginFormFieldDefinition>()

  groupFields = linkedSignal({
    source: () => this.groupDef(),
    computation: (def) => def && def.group && def.group.fields || def.fields
  })

  getGroup(form: FormGroup, name: string) {
    return form.get(name) as FormGroup;
  }

  getArray(form: FormGroup, name: string) {
    return form.get(name) as FormArray;
  }

  isVisible(def: PluginFormFieldDefinition, form: FormGroup): boolean {
    if (!def?.linkTo) return true;
    const ctrl = form.get(def.linkTo);
    if (!ctrl) return true;
    const val = ctrl.value;
    if (Object.prototype.hasOwnProperty.call(def, 'linkValue')) {
      return val === (def as any).linkValue;
    }
    return !!val;
  }
}
