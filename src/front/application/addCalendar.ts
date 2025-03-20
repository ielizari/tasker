import { Calendar } from '../domain/calendar'
import { ApiResponse } from '../../api/domain/api-response'

export const addCalendar = async (calendar: Calendar): Promise<ApiResponse> => {
  return await fetch(process.env.PUBLIC_URL + '/api/calendars/add',{
    method: 'POST',
    headers: {'Content-type': 'application/json'},
    body: JSON.stringify(calendar)
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