export type Calendar = {
  id: string,
  title: string,
  enabled: boolean,
  startDate: string,
  endDate: string,
  workHours: Array<CalendarWeek>,
  eligibleHolidays: number,
  status?: CalendarTime,
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

export enum weekDays {
  sunday = 0,
  monday = 1,
  tuesday = 2,
  wednesday = 3,
  thursday = 4,
  friday = 5,
  saturday = 6
}

export type CalendarTime = {
  expectedTotalTime: number,
  currentExpectedTime: number,
  workedTime: number,
}

export const EventTypes = {
  MEETING: { label: 'Reunión', value: '1'},
}

enum EventType {
  MEETING,
}

export type Event = {
  name: string,
  type: EventType,
  startDatetime: string,
  endDatetime: string
}

interface OrderObject {
  orderByFields?: Array<string>
  orderDirections?: Array<string>
}

export interface CalendarsFilter {
  where?: Partial<Calendar>
  order?: OrderObject
}