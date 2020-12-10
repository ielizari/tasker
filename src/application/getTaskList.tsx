import { TaskList} from './../domain/task-list'
import { ApiResponse } from '../api/domain/api-response'
 
export const getTaskList = async (): Promise<ApiResponse> => {
    return await fetch(`http://localhost:3000/api/tasks`)
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