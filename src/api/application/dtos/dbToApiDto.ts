import { WorklogDB, Worklog } from '../../domain/worklog'
import { Job, JobDB} from '../../domain/job'
import { formattedDateToISOString, ISOStringToFormatedDate } from '../../../lib/date.utils'
import { TaskDetail, TaskDB } from 'src/api/domain/task'
import { Calendar, CalendarDB } from '../../domain/calendar'
import { getTaskerRepository } from 'src/api/application/taskerRepository'

export const mapApiTaskToTaskDb = (task: TaskDetail): TaskDB => {
  const dates = {
    createdDate: formattedDateToISOString(task.createdDate),
    limitDate: formattedDateToISOString(task.limitDate),
  }
  const calendars = task.calendars?.map((calendar) => calendar.id)
  return {
    ...task,
    ...dates,
    calendars,
  }
}

export const mapTaskDbToApiTask = (task: TaskDB): TaskDetail => {
  if(!task){
    return null
  }

  const calendars = getTaskerRepository().getTaskCalendars(task)

  return {
    ...task,
    calendars,
  }
}

export const mapWorklogToApiWorklog = (worklog: WorklogDB): Worklog => {
  if(!worklog){
    return null
  }
  const dates = {
    createdDate: ISOStringToFormatedDate(worklog.createdDate),
    startDatetime: ISOStringToFormatedDate(worklog.startDatetime),
    endDatetime: ISOStringToFormatedDate(worklog.endDatetime)
  }
  return {
    ...worklog,
    ...dates
  }
}

export const mapApiWorklogToWorklogDb = (worklog: Worklog): WorklogDB => {
  const dates = {
    createdDate: formattedDateToISOString(worklog.createdDate),
    startDatetime: formattedDateToISOString(worklog.startDatetime),
    endDatetime: formattedDateToISOString(worklog.endDatetime)
  }
  return {
    ...worklog,
    ...dates
  }
}

export const mapApiJobToJobDb = (job: Job): JobDB => {
  const dates = {
    startDatetime: formattedDateToISOString(job.startDatetime),
    endDatetime: formattedDateToISOString(job.endDatetime)
  }
  return {
      ...job,
      ...dates
  }
}

export const mapApiCalendarToCalendarDb = (calendar: Calendar): CalendarDB => {
  return {
    ...calendar,
    startDate: formattedDateToISOString(calendar.startDate),
    endDate: formattedDateToISOString(calendar.endDate),
    workHours: calendar.workHours.map((week) => {
      return {
        ...week,
        startDate: formattedDateToISOString(week.startDate),
        endDate: formattedDateToISOString(week.endDate),
      }
    })
  }
}
