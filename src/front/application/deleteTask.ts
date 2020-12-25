import { ApiResponse } from '../../api/domain/api-response'

export const deleteTask = async (taskid: string): Promise<ApiResponse> => {
    return await fetch(`http://localhost:3000/api/tasks/delete/${taskid}`,{
        method: 'DELETE'
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