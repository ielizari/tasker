import { TaskList} from './../domain/task-list'
 
export const getTaskList = async (): Promise<Array<TaskList>> => {
    return await fetch(`http://localhost:3000/api/tasks`)
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