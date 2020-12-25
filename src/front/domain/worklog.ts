import {Job} from './job'

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
}