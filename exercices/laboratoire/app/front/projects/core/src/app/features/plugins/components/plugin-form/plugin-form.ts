import {Component, computed, effect, input, output} from '@angular/core';
import {FormArray, FormGroup, ReactiveFormsModule} from '@angular/forms';
import {PluginState} from '@core/src/app/features/plugins/plugin-store';
import {PluginFormDefinition, PluginFormFieldDefinition} from '@core/src/app/features/plugins/models/plugin-form';
import {PluginFormTool} from '@core/src/app/features/plugins/tools/plugin-form-tool';
import {InputGroup} from 'primeng/inputgroup';
import {FloatLabel} from 'primeng/floatlabel';
import {Textarea} from 'primeng/textarea';
import {PluginFormControl} from '@features/plugins/components/plugin-form-control/plugin-form-control';
import {Fieldset} from 'primeng/fieldset';
import {PluginFormGroup} from '@features/plugins/components/plugin-form-group/plugin-form-group';
import {PluginFormArray} from '@features/plugins/components/plugin-form-array/plugin-form-array';

@Component({
  selector: 'plugin-form',
  imports: [
    ReactiveFormsModule,
    InputGroup,
    FloatLabel,
    Textarea,
    PluginFormControl,
    PluginFormGroup,
    PluginFormArray,
    Fieldset
  ],
  templateUrl: './plugin-form.html',
  styleUrl: './plugin-form.css'
})
export class PluginForm {
  pluginIndex = input.required<any>()
  plugin = input.required<PluginState>()
  formValue = input<any | undefined>(undefined)
  // Emit latest form value to the container whenever it changes
  valueChange = output<any>()

  pluginName = computed(() => this.plugin().name)
  pluginFormDef = computed(() => this.plugin().formDefinition)

  pluginForm: FormGroup | undefined
  private formSub: any

  pluginFormState = computed(() => this.formValue())
  pluginFormEffect = effect(() => {
    const pluginName = this.pluginName()
    const formDef = this.pluginFormDef()
    const pluginFormState = this.pluginFormState()

    const form = this.createFormGroup(formDef, pluginFormState)
    if (pluginFormState) {
      form.patchValue(pluginFormState)

      const arrays = Object.entries(pluginFormState).filter(item => item[1] instanceof Array)

      for (const [key, value] of arrays) {
        this.hydrateFormArray(
          form,
          key,
          (key) => formDef.fields.find(it => it.controlType == 'array' && it.name == key),
          value as Record<string, any>[]
        )
      }
    }

    this.pluginForm = form;

    // Cleanup any previous subscription
    if (this.formSub) {
      this.formSub.unsubscribe?.()
      this.formSub = null
    }
    // Subscribe to value changes and emit upward so container can persist to store
    this.formSub = this.pluginForm.valueChanges.subscribe(v => this.valueChange.emit(v))
  })

  private hydrateForm(formGroup: FormGroup, values: Record<string, any>) {
    formGroup.patchValue(values)
  }

  private hydrateFormArray(formGroup: FormGroup, key: string, arrayDef: (key: string) => PluginFormFieldDefinition | undefined, values: Record<string, any>[]) {
    const array = this.getArray(formGroup, key)
    for (const v of values as any[]) {
      const fieldDef = arrayDef(key)
      if (fieldDef) {
        this.addItem(array, fieldDef)
      }
    }
    array.patchValue(values as any[])
  }

  private createFormGroup(groupDefinition: PluginFormDefinition, state: any) {
    return PluginFormTool.generateForm(groupDefinition)
  }

  protected readonly FormArray = FormArray;

  addItem(array: FormArray, fieldDef: PluginFormFieldDefinition) {
    if (fieldDef.group) {
      const newForm = PluginFormTool.generateFormFields(fieldDef.group.fields)
      const group = new FormGroup(newForm, {validators: PluginFormTool.generateFormValidators(fieldDef.group.validators || [])})

      array.push(group)
    }
  }

  removeItem(array: FormArray, index: number) {
    array.removeAt(index)
  }

  getGroup(pluginForm: FormGroup<any> | FormArray, name: string | number) {
    if (pluginForm instanceof FormArray) {
      return pluginForm.at(name as number) as FormGroup
    }
    return pluginForm.get(name as string) as FormGroup;
  }

  getArray(pluginForm: FormGroup, name: string) {
    return pluginForm.get(name) as FormArray
  }

  isVisible(def: PluginFormFieldDefinition, form: FormGroup): boolean {
    if (!def?.linkTo) return true;
    const ctrl = form.get(def.linkTo);
    if (!ctrl) return true;
    const val = ctrl.value;
    if (def.hasOwnProperty('linkValue')) {
      return val === (def as any).linkValue;
    }
    return !!val;
  }
}
