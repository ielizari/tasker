import { TaskDetail } from './task'
import { Worklog } from './worklog'

export interface Job{
    id: string,
    task: string,
    worklog: string,
    title: string,
    description: string,
    startDatetime: string,
    endDatetime: string,
    type: string
    tags: Array<any>
   
}

export interface JobObject {
    job: Job
    task: TaskDetail | null
    worklog: Worklog | null
}