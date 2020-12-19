import { TaskDetail, TaskObject } from '../../domain/task-detail'
import { TaskItem } from '../../domain/task-list'
import { Worklog, WorklogObject} from '../../domain/worklog'
import { Job, JobObject } from '../../domain/job'

let repository: TaskerRepository

export interface TaskerRepository{
    newId(table: string): string
    getTasks(filter?: Partial<TaskDetail>): Array<TaskItem>
    addTask(task: TaskDetail): TaskObject
    getTaskById(id: string): TaskObject
    deleteTask(id: string): boolean 
    updateTask(task: TaskDetail): TaskObject

    getWorklogs(filter?: Partial<Worklog>): Array<Worklog>
    addWorklog(worklog: Worklog): WorklogObject
    getWorklogById(id: string): WorklogObject
    deleteWorklog(id: string): boolean 
    updateWorklog(worklog: Worklog): WorklogObject

    getJobs(filter?: Partial<Job>): Array<Job>
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