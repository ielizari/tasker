import { ApiResponse } from '../../api/domain/api-response'
import { mapTaskApiTocomponent } from '../application/dtos/taskApiToComponent.dto'
 
export const getTask = async (taskid: string): Promise<ApiResponse> => {
    return await fetch(`http://localhost:3000/api/tasks/${taskid}`)
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