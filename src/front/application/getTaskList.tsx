import { ApiResponse } from '../../api/domain/api-response'
import { TaskDetail } from '../domain/task-detail'
 
export const getTaskList = async (filters?: Partial<TaskDetail>): Promise<ApiResponse> => {
    return await fetch(`${process.env.PUBLIC_URL}/api/tasks`,{
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