import { ApiResponse, ApiResponseBuilder } from '../../api/domain/api-response'

export const newDb = async (): Promise<ApiResponse> => {    
    
    return await fetch(process.env.PUBLIC_URL + '/api/db/new',{
        method: 'POST',
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