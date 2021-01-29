import { Job } from './job'

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
}

export interface OrderObject {
    orderByFields?: Array<string>
    orderDirections?: Array<string>
}
export interface WorklogsFilter {
    where?: Partial<Worklog>
    order?: OrderObject    
}