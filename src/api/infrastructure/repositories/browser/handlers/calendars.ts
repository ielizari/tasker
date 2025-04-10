import { rest } from 'msw'
import { isEmpty } from 'lodash'
import { Calendar } from '../../../../domain/calendar'
import { getTaskerRepository } from '../../../../application/taskerRepository'
import { ApiResponse, ApiResponseBuilder } from '../../../../domain/api-response'
import { ISOStringToFormatedDate } from '../../../../../lib/date.utils'
import { CalendarsFilter } from 'src/front/domain/calendar'
import { mapApiCalendarToCalendarDb } from '../../../../application/dtos/dbToApiDto'

export const calendarHandlers = [
  rest.post(process.env.PUBLIC_URL + '/api/calendars',(req, res, ctx) => {
    const filters = req.body ? req.body as Partial<CalendarsFilter> : {}
    const calendars: Array<Calendar> = getTaskerRepository().getCalendars(filters)

    const response : ApiResponse = {
      status: 200,
      hasError: false,
      data: calendars
    }
    return res(
      ctx.status(200),
      ctx.json(response)
    )
  }),
  rest.get(process.env.PUBLIC_URL + '/api/calendars/:calendarid',(req, res, ctx) => {
    const calendarid = req.params.calendarid || '';
    const calendar = getTaskerRepository().getCalendarById(calendarid)

    if(calendar){
      return res(
        ctx.status(200),
        ctx.json(ApiResponseBuilder(200,calendar,false))
      )
    }else{
      return res(
        ctx.status(404, 'El calendario no existe'),
        ctx.json(ApiResponseBuilder(404,{},true,'El calendario no existe'))
      )
    }
  }),

  rest.post(process.env.PUBLIC_URL + '/api/calendars/add',(req,res,ctx) =>{
    try{
      const calendar: Calendar | null = req.body ? req.body as Calendar : null

      if(isEmpty(calendar.id)) {
        calendar.id = getTaskerRepository().newId('calendars')
      }else{
        throw new Error('Un calendario nuevo no puede contener un valor en el campo "id"')
      }

      //calendar.createdDate = ISOStringToFormatedDate(new Date().toISOString())
      let result = getTaskerRepository().addCalendar(mapApiCalendarToCalendarDb(calendar))
      return res(
        ctx.status(200),
        ctx.json(ApiResponseBuilder(200,result,false))
      )
    }catch(e){
      return res(
        ctx.status(500),
        ctx.json(ApiResponseBuilder(500,{},true,e.message))
      )
    }
  }),

  rest.get(process.env.PUBLIC_URL + '/api/calendars/status/:calendarid',(req,res,ctx) =>{
    const calendarid = req.params.calendarid || '';
    const calendarStatus = getTaskerRepository().getCalendarStatus(calendarid)

    if(calendarStatus){
      return res(
        ctx.status(200),
        ctx.json(ApiResponseBuilder(200,calendarStatus,false))
      )
    }else{
      return res(
        ctx.status(404, 'El calendario no existe'),
        ctx.json(ApiResponseBuilder(404,{},true,'El calendario no existe'))
      )
    }
  }),

  rest.delete(process.env.PUBLIC_URL + '/api/calendars/delete/:calendarid', (req,res,ctx) => {
    try{
      const calendarid = req.params.calendarid || '';
      if(calendarid === ''){
        return res(
          ctx.status(400),
          ctx.json(ApiResponseBuilder(400,{},true,'Id de calendario no válido'))
        )
      }else{
        let result = getTaskerRepository().deleteCalendar(calendarid)
        return res(
          ctx.status(200),
          ctx.json(ApiResponseBuilder(200,result,false))
        )
      }
    }catch(e){
      return res(
        ctx.status(500),
        ctx.json(ApiResponseBuilder(500,{},true,e.message))
      )
    }
  }),

  rest.put(process.env.PUBLIC_URL + '/api/calendars/update', (req, res, ctx) => {
    try{
      const calendar: Calendar | null = req.body ? req.body as Calendar : null

      if(isEmpty(calendar.id)) {
        throw new Error('Es necesario proporcionar el id del calendario a editar')
      }

      let result: Calendar = getTaskerRepository().updateCalendar(mapApiCalendarToCalendarDb(calendar))
      return res(
        ctx.status(200),
        ctx.json(ApiResponseBuilder(200,result,false))
      )
    }catch(e){
      return res(
        ctx.status(500),
        ctx.json(ApiResponseBuilder(500,{},true,e.message))
      )
    }
  }),
]