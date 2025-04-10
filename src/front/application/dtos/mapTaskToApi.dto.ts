import { ISOStringToFormatedDate } from 'src/lib/date.utils'
import { TaskDetail } from 'src/front/domain/task-detail'

export const mapTaskToApi = (task: TaskDetail): TaskDetail => {
    if(!task){
        return null
    }
    const dates = {
      createdDate: ISOStringToFormatedDate(task.createdDate),
      limitDate: ISOStringToFormatedDate(task.limitDate),
    }
    return {
        ...task,
        ...dates,
    }
}