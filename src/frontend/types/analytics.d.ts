export type ActivityDay = {
  date: string
  workedSeconds: number
}

export type ActivityHeatmapResponse = {
  days: ActivityDay[]
}
