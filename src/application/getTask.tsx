import { ApiResponse } from '../api/domain/api-response'
 
export const getTask = async (taskid: string): Promise<ApiResponse> => {
    return await fetch(`http://localhost:3000/api/tasks/${taskid}`)
        .then(res => res.json())        
        .then(
            (result) => {  
                console.log(result) 
                return result
             },
            (error) => { 
                throw new Error(error)
            }
        )
}