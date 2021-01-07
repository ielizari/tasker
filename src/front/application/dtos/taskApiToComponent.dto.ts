import { TaskDetail} from '../../domain/task'
import { formattedDateToISOString, ISOStringToFormatedDate } from '../../../lib/date.utils'

export const mapTaskApiTocomponent = (task: TaskDetail): TaskDetail => {
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