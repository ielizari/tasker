import { Worklog } from '../domain/worklog'
import { ApiResponse } from '../../api/domain/api-response'

export const addWorklog = async (worklog: Worklog): Promise<ApiResponse> => {
    
    return await fetch(process.env.PUBLIC_URL + '/api/worklogs/add',{
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(worklog)
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