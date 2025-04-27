import { ApiResponse } from '../../api/domain/api-response'

export const getCalendarJobsByDay = async (calendarid: string): Promise<ApiResponse> => {
  return await fetch(`${process.env.PUBLIC_URL}/api/calendars/days/${calendarid}`)
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