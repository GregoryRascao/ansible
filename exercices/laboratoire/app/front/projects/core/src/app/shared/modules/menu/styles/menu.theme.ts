// export type CoreMenuStyleContainer = Partial<{
//   backgroundColor: string
//   padding: string
// }>
// export type CoreMenuStyleVertical = Partial<{
//   height: string
//   width: string
// }>
// export type CoreMenuStyleHorizontal = Partial<{
//   height: string
//   width: string
// }>
// export type CoreMenuStyleLink = Partial<{
//   color: string
//   active: string
//   hover: string
//   icon: {
//     size: string
//   }
// }>
// export type CoreMenuStyleFont = Partial<{
//   size: string
// }>
// export type CoreMenuStylePart = Partial<{
//   justify: 'start' | 'center' | 'end'
//   align: 'start' | 'center' | 'end'
//   gap: string
// }>
// export type CoreMenuStyle = Partial<{
//   container: CoreMenuStyleContainer
//   vertical: CoreMenuStyleVertical,
//   horizontal: CoreMenuStyleHorizontal,
//   link: CoreMenuStyleLink,
//   font: CoreMenuStyleFont,
// }>
//
// export const defaultCoreMenuStyle: CoreMenuStyle = {
//   container: {
//     backgroundColor: '{primary.300}',
//     padding: '20px'
//   },
//   vertical: {
//     height: '80vh',
//     width: '8%'
//   },
//   horizontal: {
//     height: '5vh',
//     width: '85%'
//   },
//   link: {
//     color: 'white',
//     active: '{primary.700}',
//     hover: '{primary.800}',
//     icon: {
//       size: '2rem'
//     }
//   },
//   font: {
//     size: '1rem'
//   }
//
// }
//
// export type CoreMenuStyleDef = { menu: CoreMenuStyle }


export type CoreMenuStyleFont = Partial<{
  size: string
  weight: string
  family: string
}>
export type CoreMenuStyleIcon = Partial<{}>
export type CoreMenuStyleContainer = Partial<{
  backgroundColor: string
  padding: string
  margin: string
  boxShadow: string
}>
export type CoreMenuStylePart = Partial<{
  justify: 'start' | 'center' | 'end'
  align: 'start' | 'center' | 'end'
  gap: string
}>
export type CoreMenuStyleVertical = Partial<{
  height: string
  width: string
}>
export type CoreMenuStyleHorizontal = Partial<{
  height: string
  width: string
}>
export type CoreMenuStyleLinks = CoreMenuStylePart
export type CoreMenuStyleLinkGroup = Partial<{
  color: string
  size: string
  weight: string
}>
export type CoreMenuStyleLink = Partial<{
  font: CoreMenuStyleFont
  icon: CoreMenuStyleIcon
  color: string
  active: string
  hover: string
  focus: string
  disabled: string
  group: CoreMenuStyleLinkGroup
}>

export type CoreMenuStyle = Partial<{
  font: CoreMenuStyleFont
  container: CoreMenuStyleContainer
  vertical: CoreMenuStyleVertical
  horizontal: CoreMenuStyleHorizontal
  links: CoreMenuStyleLinks
  link: CoreMenuStyleLink
  start: CoreMenuStylePart
  center: CoreMenuStylePart
  end: CoreMenuStylePart
}>

export type CoreMenuTheme = { menu: CoreMenuStyle }
