import { Job } from '../domain/job'
import { ApiResponse } from '../../api/domain/api-response'

export const addJob = async (job: Job): Promise<ApiResponse> => {    
    return await fetch('http://localhost:3000/api/jobs/add',{
        method: 'POST',
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