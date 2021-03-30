export interface Timeseries {
  symbols: Array<string>,
  intervals: Array<string>,
  startDate: string,
  endDate: string,
  order: string,
  timezone: string,
  methods?: Array<string>
}

export interface ChartQuery {
  pair: string,
  time: string
}