import { TaskDetail } from '../domain/task-detail'

export const addTask = async (task: TaskDetail): Promise<string> => {

    return await fetch('http://localhost:3000/api/tasks/add',{
        method: 'POST',
        headers: {'Content-type': 'application/json'},
        body: JSON.stringify(task)
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