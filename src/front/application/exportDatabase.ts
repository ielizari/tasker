import { ApiResponse } from '../../api/domain/api-response'

export const exportDb = async (): Promise<ApiResponse> => {

    return await fetch('http://localhost:3000/api/db/export',{
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