import { Worklog} from './../domain/worklog'
import { ApiResponse } from '../../api/domain/api-response'
 
export const getWorklogList = async (filters?: Partial<Worklog>): Promise<ApiResponse> => {
    return await fetch(`${process.env.PUBLIC_URL}/api/worklogs`,{
        method: 'POST',
        body: JSON.stringify(filters)
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