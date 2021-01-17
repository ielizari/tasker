import { Job } from '../domain/job'
import { ApiResponse } from '../../api/domain/api-response'

export const updateJob = async (job: Job): Promise<ApiResponse> => {

    return await fetch(process.env.PUBLIC_URL + '/api/jobs/update',{
        method: 'PUT',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(job)
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