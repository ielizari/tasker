import lowdb from 'lowdb'
//import FileSync from 'lowdb/adapters/FileSync'
import LocalStorage from 'lowdb/adapters/LocalStorage'
import { TaskDetail } from '../../../domain/task-detail'
import { TaskItem } from '../../../domain/task-list'
import { TaskerRepository } from '../../../application/taskerRepository'

type Schema = {
    tasks: Array<TaskDetail>
}
const data :Schema = require('./db/taskerdb.json')

//const adapter = new FileSync<schema>('./db/taskerdb.json')
const adapter = new LocalStorage<Schema>('db')

export const db = lowdb(adapter)

export class LowdbLocalstorageRepository implements TaskerRepository {
    getTasks(): Array<TaskItem>  {
        const tasks = db.get('tasks').take(5).value()
        const result : Array<TaskItem>= []
        tasks.map((task: TaskDetail) => {
            result.push({
                id: task.id || '',
                title: task.title || '',
                limitDate: task.limitDate || undefined
            })
        })
        return result
    }
    getTaskById(id: string): TaskDetail {
        const task = db.get('tasks').find({id: id}).value()
        return task
    }
    addTask (task: TaskDetail){
        db.get('tasks').push(task).write()
        return 1
    }
}
export const initDB = () => {
    if(!db.has('tasks').value()){
        console.log("DB vacía")
        db.defaults({ tasks: [] }).write()

        const tasks : Array<TaskDetail> = data.tasks
        for(let i=0; i< tasks.length; i++){         
            console.log(tasks[i])   
            db.get('tasks').push(tasks[i]).write()
        }        
    }else{
        console.log("DB con registros")
    }
}