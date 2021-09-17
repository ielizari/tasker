import { TaskDetail, TaskObject } from '../domain/task'
import { Worklog, WorklogObject } from '../domain/worklog'
import { Job, JobObject } from '../domain/job'
import { Schema } from '../infrastructure/repositories/browser/browserdb'

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
}

export function setTaskerRepository(repo: TaskerRepository){
    repository = repo
}

export function getTaskerRepository(): TaskerRepository {
    return repository
}