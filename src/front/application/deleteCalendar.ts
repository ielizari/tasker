import { ApiResponse } from '../../api/domain/api-response'

export const deleteCalendar = async (calendarid: string): Promise<ApiResponse> => {
  return await fetch(`${process.env.PUBLIC_URL}/api/calendars/delete/${calendarid}`,{
    method: 'DELETE'
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