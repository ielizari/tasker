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
  nonWorking: CalendarNonWorkingTypes,
  sunday: number,
  monday: number,
  tuesday: number,
  wednesday: number,
  thursday: number,
  friday: number,
  saturday: number,
  title?: string,
  priority: number,
}

export enum CalendarNonWorkingTypes {
  HOLIDAY = 'holiday',
  ELIGIBLE_HOLIDAY = 'eligible_holiday',
  SICK_DAY = 'sick_day',
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
  expectedWeekTime: number,
  currentWeekExpectedTime: number,
  currentWeekWorkTime: number,
  expectedMonthTime: number,
  currentMonthExpectedTime: number,
  currentMonthWorkTime: number,
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

export const NonWorkingOptions = [
  {
    label: '',
    value: ''
  },
  {
    label: "Vacaciones obligatorias",
    value: CalendarNonWorkingTypes.HOLIDAY
  },
  {
    label: "Vacaciones elegibles",
    value: CalendarNonWorkingTypes.ELIGIBLE_HOLIDAY
  },
  { label: "Baja",
    value: CalendarNonWorkingTypes.SICK_DAY
  },
]
