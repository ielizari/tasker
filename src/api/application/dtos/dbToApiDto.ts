import { WorklogDB, Worklog } from '../../domain/worklog'
import { Job, JobDB} from '../../domain/job'
import { formattedDateToISOString, ISOStringToFormatedDate } from '../../../lib/date.utils'
import { TaskDetail, TaskDB } from 'src/front/domain/task-detail'

export const mapTaskToApiTask = (task: TaskDB): TaskDetail => {
    if(!task){
        return null
    }
    const dates = {
        createdDate: ISOStringToFormatedDate(task.createdDate),
        limitDate: ISOStringToFormatedDate(task.limitDate),
    }
    return {
        ...task, 
        ...dates
    }
}

export const mapApiTaskToTaskDb = (task: TaskDetail): TaskDB => {
    const dates = {
        createdDate: formattedDateToISOString(task.createdDate),
        limitDate: formattedDateToISOString(task.limitDate),
    }
    return {
        ...task, 
        ...dates
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
        //createdDate: formattedDateToISOString(worklog.createdDate),
        startDatetime: formattedDateToISOString(job.startDatetime),
        endDatetime: formattedDateToISOString(job.endDatetime)
    }
    return {
        ...job, 
        ...dates
    }
}
