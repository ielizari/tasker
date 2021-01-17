import { ApiResponse } from '../../api/domain/api-response'

export const exportDb = async (): Promise<ApiResponse> => {

    return await fetch(process.env.PUBLIC_URL + '/api/db/export',{
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