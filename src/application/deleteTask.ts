import { TaskDetail } from '../domain/task-detail'

export const deleteTask = async (taskid: string): Promise<string> => {

    return await fetch(`http://localhost:3000/api/tasks/delete/${taskid}`,{
        method: 'DELETE'
    })
        .then(res => res.json())        
        .then(
            (result) => {                
                if(result.errMessage){
                    throw new Error(result.errMessage)
                }
                return result
             },
            (error) => { 
                throw new Error(error)
            }
        )
}