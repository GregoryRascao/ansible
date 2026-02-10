import {Validators} from '@angular/forms';

export type PluginFormValidator = { name: keyof Validators | string, params?: any }

export type PluginFormFieldInputType =
  "text"
  | "number"
  | "date"
  | "datetime-local"
  | "email"
  | "password"
  | "tel"
  | "url"
  | "hidden"
export type PluginFormFieldFormType = "input" | "select" | "textarea" | "checkbox" | "radio"
export type PluginFormFieldControlType = "control" | "group" | "array"
export type PluginFormFieldDefinition = {
  name: string
  label: string
  formType: PluginFormFieldFormType
  controlType: PluginFormFieldControlType
  optional: boolean
  defaultValue?: any
  validators: PluginFormValidator[]
  selectValues?: { label: string, value: any }[]
  inputType?: PluginFormFieldInputType
  fields?: PluginFormFieldDefinition[]
  group?: PluginFormDefinition
  linkTo?: string
  linkValue?: any
}
export type PluginFormDefinition = {
  inLine: boolean
  contextualHelper?: string,
  fields: PluginFormFieldDefinition[]
  validators: PluginFormValidator[]
}

export type PluginType = "metadata" | "source" | "transform" | "destination" | "resume"
