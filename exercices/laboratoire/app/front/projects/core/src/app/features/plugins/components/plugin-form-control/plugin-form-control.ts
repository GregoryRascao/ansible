import {Component, computed, effect, forwardRef, inject, Injector, input, model, signal} from '@angular/core';
import {FloatLabel} from 'primeng/floatlabel';
import {
  AbstractControl,
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule
} from '@angular/forms';
import {InputText} from 'primeng/inputtext';
import {Select} from 'primeng/select';
import {PluginFormFieldDefinition} from '@features/plugins/models/plugin-form';
import {Textarea} from 'primeng/textarea';
import {Checkbox} from 'primeng/checkbox';
import {PluginFormTool} from '@features/plugins/tools/plugin-form-tool';
import {TranslateService} from '@ngx-translate/core';
import {Message} from 'primeng/message';
import {InputNumber} from 'primeng/inputnumber';
import {DatePicker} from 'primeng/datepicker';

@Component({
  selector: 'plugin-form-control',
  imports: [
    FloatLabel,
    FormsModule,
    InputText,
    ReactiveFormsModule,
    Select,
    Textarea,
    Checkbox,
    Message,
    InputNumber,
    DatePicker
  ],
  templateUrl: './plugin-form-control.html',
  styleUrl: './plugin-form-control.css',
  providers: [
    {provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => PluginFormControl), multi: true}
  ]
})
export class PluginFormControl implements ControlValueAccessor {
  private $injector = inject(Injector)
  private $translate = inject(TranslateService)
  fieldDef = input.required<PluginFormFieldDefinition>();

  value = model<any | undefined>(undefined);

  valueEffect = effect(() => {
    const value = this.value()

    this.onChange(value);
  })
  disable = signal(false);

  control = input.required<AbstractControl>();

  showError = computed(() => {
    return !this.isValid()
  })

  errors = computed(() => {
    const fieldDef = this.fieldDef();
    const validators = PluginFormTool.generateFormValidators(fieldDef.validators || [])

    return validators.map(v => {
      return v(this.control())
    })
      .filter(v => v != null)
  })

  errorMessages = computed<string[]>(() => {
    const fieldDef = this.fieldDef();
    const errors = this.errors();
    const label = fieldDef.label || 'Ce champ';

    const stringErrors = [];

    for (const error of errors) {
      if (error['required']) {
        stringErrors.push(this.$translate.instant('workflow.form.errors.required', {label}))
      }
      if (error['minlength']) {
        stringErrors.push(this.$translate.instant('workflow.form.errors.minLength', {
          label,
          minLength: error['minlength'].requiredLength
        }));
      }
      if (error['maxlength']) {
        stringErrors.push(this.$translate.instant('workflow.form.errors.maxLength', {
          label,
          minLength: error['maxlength'].requiredLength
        }));
      }
      if (error['email']) {
        stringErrors.push(this.$translate.instant('workflow.form.errors.email', {label}))
      }
      if (error['pattern']) {
        stringErrors.push(this.$translate.instant('workflow.form.errors.pattern', {label}))
      }
      if (error['min']) {
        stringErrors.push(this.$translate.instant('workflow.form.errors.min', {label, min: error['min'].min}))
      }
      if (error['max']) {
        stringErrors.push(this.$translate.instant('workflow.form.errors.max', {label, min: error['max'].max}))
      }
      if (error['json']) {
        stringErrors.push(this.$translate.instant('workflow.form.errors.json', {label}))
      }
    }
    return stringErrors;
    // return this.$translate.instant('workflow.form.errors.default', {label});
  })

  ngAfterViewInit() {
  }

  onChange: (value: any) => void = () => {
  };
  onTouched: () => void = () => {
  };

  writeValue(obj: any): void {
    this.value.set(obj);
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.disable.set(isDisabled);
  }

  isValid = computed(() => {
    const fieldDef = this.fieldDef();
    const value = this.value()
    const control = this.control()
    const validators = PluginFormTool.generateFormValidators(fieldDef.validators || [])

    const errors = validators.map(v => v(control)).filter(v => v != null)
    return errors.length === 0;
  })
}
