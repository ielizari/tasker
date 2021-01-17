import { ApiResponse } from '../../api/domain/api-response'

export const isSyncedDb = async (): Promise<ApiResponse> => {

    return await fetch(process.env.PUBLIC_URL + '/api/db/synced',{
        method: 'GET',
    })
        .then(res => res.json())        
        .then(
            (result) => { 
                return result
             },
            (error) => { 
                console.log(error)
                throw new Error(error)
            }
        )
}