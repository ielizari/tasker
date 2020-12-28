import { ApiResponse } from '../../api/domain/api-response'
 
export const getWorklog = async (worklogid: string): Promise<ApiResponse> => {
    return await fetch(`http://localhost:3000/api/worklogs/${worklogid}`)
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