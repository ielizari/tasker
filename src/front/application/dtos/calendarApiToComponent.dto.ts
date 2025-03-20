import { Calendar } from '../../domain/calendar'
import { ISOStringToFormatedDate } from '../../../lib/date.utils'

export const mapCalendarApiTocomponent = (calendar: Calendar): Calendar => {
  if(!calendar){
    return null
  }

  return {
    ...calendar,
    startDate: ISOStringToFormatedDate(calendar.startDate),
    endDate: ISOStringToFormatedDate(calendar.endDate),
    workHours: calendar.workHours.map((week) => {
      return {
        ...week,
        startDate: ISOStringToFormatedDate(week.startDate),
        endDate: ISOStringToFormatedDate(week.endDate),
      }
    })
  }
}