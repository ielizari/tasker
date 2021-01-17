import { ApiResponse } from '../../api/domain/api-response'

export const deleteTask = async (taskid: string): Promise<ApiResponse> => {
    return await fetch(`${process.env.PUBLIC_URL}/api/tasks/delete/${taskid}`,{
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