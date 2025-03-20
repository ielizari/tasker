export interface Calendar {
  id: string,
  title: string,
  enabled: boolean,
  startDate: string,
  endDate: string,
  workHours: Array<CalendarWeek>,
  eligibleHolidays: number,
}

export interface CalendarDB {
  id: string,
  title: string,
  enabled: boolean,
  startDate: string,
  endDate: string,
  workHours: Array<CalendarWeek>,
  eligibleHolidays: number,
}

export type CalendarWeek = {
  startDate: string,
  endDate: string,
  isHoliday: boolean,
  sunday: number,
  monday: number,
  tuesday: number,
  wednesday: number,
  thursday: number,
  friday: number,
  saturday: number
}

export type CalendarDay = {
  workHours: number,
  date: string,
  events?: Array<Event>
}
