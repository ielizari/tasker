import { ApiResponse } from '../../api/domain/api-response'
 
export const getWorklog = async (worklogid: string): Promise<ApiResponse> => {
    return await fetch(`${process.env.PUBLIC_URL}/api/worklogs/${worklogid}`)
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