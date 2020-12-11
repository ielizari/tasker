import lowdb from 'lowdb'
//import FileSync from 'lowdb/adapters/FileSync'
import LocalStorage from 'lowdb/adapters/LocalStorage'
import { TaskDetail, TaskObject } from '../../../domain/task-detail'
import { TaskItem } from '../../../domain/task-list'
import { TaskerRepository, setTaskerRepository } from '../../application/taskerRepository'

type Schema = {
    tasks: Array<TaskDetail>
}
const data :Schema = require('./db/taskerdb.json')

//const adapter = new FileSync<schema>('./db/taskerdb.json')
const adapter = new LocalStorage<Schema>('db')

export const db = lowdb(adapter)

export class LowdbLocalstorageRepository implements TaskerRepository {
    newId(table: string) : string {
        let res: Array<TaskDetail>
        let id: string 
        switch(table){
            case 'tasks':
                res = db.get('tasks').orderBy('id','desc').take(1).value()
                id = res.length ? (parseInt(res[0].id) + 1).toString() : '1'
                break
            default:
                throw new Error(`La tabla '${table}' no existe`)
        }
        console.log('generatedid',id)
        return id
    }
    getTasks(filter: Partial<TaskDetail> = {}): Array<TaskItem>  {
        const search = JSON.parse(filter as string)
        const tasks = db.get('tasks').filter(search).value()
        console.log(tasks)
        const result : Array<TaskItem>= []
        tasks.map((task: TaskDetail) => {
            result.push({
                id: task.id || '',
                title: task.title || '',
                limitDate: task.limitDate || ''
            })
        })
        return result
    }
    getTaskById(id: string): TaskObject {    
        try{    
            let task = db.get('tasks').find({id: id}).value() || null
            console.log("Tarea",task)
            let parentTask = null;
            let childTasks = [];
            childTasks = childTasks.concat(db.get('tasks').find({parent: id}).value() || []);
            if(task && task.parent !== ''){
                parentTask = db.get('tasks').find({id: task.parent}).value()
            }

            const taskObject : TaskObject= {
                task: task,
                parentTask: parentTask,
                childTasks: childTasks
            }
            return taskObject
        }catch (e){
            throw e
        }
    }
    addTask (task: TaskDetail): TaskObject{  
        try{      
             db.get('tasks').push(task).write()
             return this.getTaskById(task.id)
        }catch(e){
            throw e
        }
    }

    updateTask(task: TaskDetail): TaskObject{
        try{
            console.log("Editandooo",task)
            db.get('tasks').find({id: task.id}).assign(task).write()
            return this.getTaskById(task.id)
        }catch(e){
            throw e
        }
    }
    deleteTask(taskid: string): boolean{
        try{
            const task = db.get('tasks').find({id: taskid}).value()
            if(task){
                db.get('tasks').remove({id: taskid}).write()
            }else{
                return false
            }
            return true
        }catch(e){
            throw e
        }
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

    setTaskerRepository(new LowdbLocalstorageRepository())
}