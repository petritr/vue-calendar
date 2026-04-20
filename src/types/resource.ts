export interface ResourceColors {
  main: string
  container: string
  onContainer: string
}

export interface Resource {
  id: string | number
  label: string
  colorName?: string
  lightColors?: ResourceColors
  darkColors?: ResourceColors
  avatar?: string
}

export interface ResourceViewConfig {
  /** Height of each resource row in pixels */
  rowHeight?: number
  /** Width of the sidebar in pixels */
  sidebarWidth?: number
  /** Width of each hour column in pixels */
  hourWidth?: number
}
