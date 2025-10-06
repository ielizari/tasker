import { TaskDetail, TaskObject, TaskDB } from 'src/api/domain/task'
import { Worklog, WorklogObject } from 'src/api/domain/worklog'
import { Job, JobObject } from 'src/api/domain/job'
import { Calendar, CalendarTime, CalendarDayJobs } from 'src/api/domain/calendar'
import { Schema } from 'src/api/infrastructure/repositories/browser/browserdb'
import { CalendarsFilter } from 'src/front/domain/calendar'

let repository: TaskerRepository

export interface FileDownload {
  blob: string,
  filename: string
}

export interface OrderObject {
  orderByFields?: Array<string>
  orderDirections?: Array<string>
}

export interface WorklogsFilter {
  where?: Partial<Worklog>
  order?: OrderObject
}

export interface TaskerRepository{
  newId(table: string): string

  newDb(): boolean
  importDb(db: Schema): boolean
  exportDb(): FileDownload
  hasDB(): boolean
  initDB(): void
  emptyDbObject(): Schema
  setDbLastModified(date: string): boolean
  setDbLastExported(date: string): boolean
  isDbSynced(): boolean

  getTasks(filter?: Partial<TaskDetail>, order?: Array<string>, orderDirection?: Array<string>): Array<TaskObject>
  addTask(task: TaskDetail): TaskObject
  getTaskById(id: string): TaskObject
  getTaskCalendars(task: TaskDB): Array<Calendar>
  getTaskGroupedData(id: string): any
  deleteTask(id: string): boolean
  updateTask(task: TaskDetail): TaskObject

  getWorklogs(filter?: WorklogsFilter): Array<Worklog>
  addWorklog(worklog: Worklog): WorklogObject
  getWorklogById(id: string): WorklogObject
  deleteWorklog(id: string): boolean
  updateWorklog(worklog: Worklog): WorklogObject
  closeWorklog(worklog: Worklog): WorklogObject
  reopenWorklog(worklog: Worklog): WorklogObject
  getWorklogGroupedData(worklogid: string): any

  getJobs(filter?: Partial<Job>): Array<JobObject>
  addJob(job:Job): JobObject
  getJobById(id: string): JobObject
  deleteJob(id: string): boolean
  updateJob(job: Job): JobObject

  getCalendars(filter?: Partial<CalendarsFilter>): Array<Calendar>
  getCalendarById(id: string): Calendar
  getCalendarStatus(calendarid: string): CalendarTime
  getCalendarJobsByDay(calendarid: string): Array<CalendarDayJobs>
  getCalendarExpectedTime (calendar: Calendar): Partial<CalendarTime>
  getCalendarDayWorkhours(calendarid: string, date: string)
  addCalendar(calendar: Calendar): Calendar
  updateCalendar(calendar: Calendar): Calendar
  deleteCalendar(id: string): boolean
}

export function setTaskerRepository(repo: TaskerRepository){
  repository = repo
}

export function getTaskerRepository(): TaskerRepository {
  return repository
}