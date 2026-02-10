export type hTitleStyleFont = Partial<{
  size: string,
  weight: string,
  sizeMultiplier: string,
}>
export type hTitleStyleLine = Partial<{
  height: string,
}>
export type HTitleStyle = Partial<{
  font: hTitleStyleFont,
  line: hTitleStyleLine,
  color: string,
  decoration: string
}>

export type HTitleTheme = { title: HTitleStyle }
