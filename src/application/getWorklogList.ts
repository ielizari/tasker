import { Worklog} from './../domain/worklog'
import { ApiResponse } from '../api/domain/api-response'
 
export const getWorklogList = async (filters?: Partial<Worklog>): Promise<ApiResponse> => {
    return await fetch(`http://localhost:3000/api/worklogs`,{
        method: 'POST',
        body: JSON.stringify(filters)
    })
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