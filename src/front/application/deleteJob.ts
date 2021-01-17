import { ApiResponse } from '../../api/domain/api-response'

export const deleteJob = async (jobid: string): Promise<ApiResponse> => {
    return await fetch(`http://localhost:3000/api/jobs/delete/${jobid}`,{
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