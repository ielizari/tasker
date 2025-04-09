import { Job } from './job'
import { Calendar } from 'src/api/domain/calendar'

export interface WorklogDB {       
    id: string,
    createdDate: string,
    startDatetime: string,
    endDatetime: string,
    title: string,
    tags: Array<any>   
}

export interface Worklog {
    id: string,
    createdDate: string,
    startDatetime: string,
    endDatetime: string,
    title: string,
    tags: Array<any>
}

export interface WorklogObject {
    worklog: Worklog
    childJobs: Array<Job>
    calendars: Array<Calendar>
}
