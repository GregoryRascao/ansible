export type MIndicatorBackground = {
  green: string,
  orange: string,
  red: string,
}
export type MIndicatorPulseTheme = {
  duration: string
}
export type MIndicatorThemeOptions = {
  size: string,
  pulse: MIndicatorPulseTheme,
  background: Partial<MIndicatorBackground>
}

export type MIndicatorTheme = Partial<MIndicatorThemeOptions>
