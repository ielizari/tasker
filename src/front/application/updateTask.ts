import { TaskDetail } from '../domain/task-detail'
import { ApiResponse } from '../../api/domain/api-response'

export const updateTask = async (task: TaskDetail): Promise<ApiResponse> => {

    return await fetch(process.env.PUBLIC_URL + '/api/tasks/update',{
        method: 'PUT',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(task)
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