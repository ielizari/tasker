import { ApiResponse } from '../../api/domain/api-response'

export const existsDb = async (): Promise<ApiResponse> => {

    return await fetch('http://localhost:3000/api/db/exists',{
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