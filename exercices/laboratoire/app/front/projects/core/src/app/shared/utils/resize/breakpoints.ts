const fromRemToPixel = (rem: number) => parseFloat(getComputedStyle(document.documentElement).fontSize) * rem;

export const breakpoints = {
  sm: fromRemToPixel(40),
  md: fromRemToPixel(48),
  lg: fromRemToPixel(64),
  xl: fromRemToPixel(80),
  '2xl': fromRemToPixel(96)
}
