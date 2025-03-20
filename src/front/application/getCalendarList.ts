import { ApiResponse } from '../../api/domain/api-response'
import { CalendarsFilter } from '../domain/calendar'

export const getCalendarList = async (filters?: Partial<CalendarsFilter>): Promise<ApiResponse> => {
  return await fetch(`${process.env.PUBLIC_URL}/api/calendars`,{
    method: 'POST',
    body: JSON.stringify(filters)
  })
  .then(res => res.json())
  .then(
    (result) => {
      return result
    },
    (error) => {
      throw new Error(error)
    }
  )
}