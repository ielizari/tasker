import { ApiResponse } from '../../api/domain/api-response'
 
export const getTaskGroupedData = async (taskid: string): Promise<ApiResponse> => {
    return await fetch(`${process.env.PUBLIC_URL}/api/tasks/${taskid}/grouped`,{
        method: 'GET',
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