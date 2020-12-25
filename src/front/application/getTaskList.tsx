import { TaskList} from './../domain/task-list'
import { ApiResponse } from '../../api/domain/api-response'
import { TaskDetail } from '../domain/task-detail'
 
export const getTaskList = async (filters?: Partial<TaskDetail>): Promise<ApiResponse> => {
    return await fetch(`http://localhost:3000/api/tasks`,{
        method: 'POST',
        body: JSON.stringify(filters)
    })
        .then(res => res.json())        
        .then(
            (result) => {  
                return result
             },
            (error) => { 
                throw new Error(error)
            }
        )
}