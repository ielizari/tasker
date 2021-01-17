import { ApiResponse } from '../../api/domain/api-response'
import { WorklogObject } from '../domain/worklog'
 
export const getWorklogGrouped = async (worklogid: string): Promise<ApiResponse> => {
    return await fetch(`${process.env.PUBLIC_URL}/api/worklogs/${worklogid}/grouped`,{
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