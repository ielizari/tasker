import { ApiResponse, ApiResponseBuilder } from '../../api/domain/api-response'

export const newDb = async (): Promise<ApiResponse> => {    
    
    return await fetch('http://localhost:3000/api/db/new',{
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