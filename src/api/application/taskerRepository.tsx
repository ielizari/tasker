import { TaskDetail, TaskItem, TaskObject } from '../domain/task'
import { Worklog, WorklogObject } from '../domain/worklog'
import { Job, JobObject } from '../domain/job'
import { Schema } from '../infrastructure/repositories/browser/browserdb'

let repository: TaskerRepository

export interface FileDownload {
    blob: string,
    filename: string
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

    getTasks(filter?: Partial<TaskDetail>): Array<TaskObject>
    addTask(task: TaskDetail): TaskObject
    getTaskById(id: string): TaskObject
    deleteTask(id: string): boolean 
    updateTask(task: TaskDetail): TaskObject

    getWorklogs(filter?: Partial<Worklog>): Array<Worklog>
    addWorklog(worklog: Worklog): WorklogObject
    getWorklogById(id: string): WorklogObject
    deleteWorklog(id: string): boolean 
    updateWorklog(worklog: Worklog): WorklogObject
    closeWorklog(worklog: Worklog): WorklogObject
    reopenWorklog(worklog: Worklog): WorklogObject

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