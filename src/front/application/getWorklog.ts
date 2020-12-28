import { ApiResponse } from '../../api/domain/api-response'
 
export const getWorklog = async (worklogid: string): Promise<ApiResponse> => {
    return await fetch(`http://localhost:3000/api/worklogs/${worklogid}`)
        .then(res => res.json())        
        .then(
            (result) => {
                console.log("Vamoooooooooooooooooooooooos2")
                console.log(result)
                return result
             },
            (error) => { 
                console.log("hoy no")
                throw new Error(error)
            }
        )
}