import { ISOStringToFormatedDate } from 'src/lib/date.utils'
import { TaskDetail, TaskComponent } from 'src/front/domain/task-detail'

export const mapTaskToApi = (task: TaskComponent): TaskDetail => {
    if(!task){
        return null
    }
    const dates = {
      createdDate: ISOStringToFormatedDate(task.createdDate),
      limitDate: ISOStringToFormatedDate(task.limitDate),
    }
    const calendars = task.calendars?.map((calendar) => calendar.id)
    return {
        ...task,
        ...dates,
        calendars,
    }
}