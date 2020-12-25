import lowdb from 'lowdb'
//import FileSync from 'lowdb/adapters/FileSync'
import LocalStorage from 'lowdb/adapters/LocalStorage'
import { TaskDetail, TaskObject } from '../../../../front/domain/task-detail'
import { TaskItem } from '../../../../front/domain/task-list'
import { Worklog, WorklogObject } from '../../../../front/domain/worklog'
import { Job, JobObject } from '../../../../front/domain/job'

import { TaskerRepository, setTaskerRepository, FileDownload } from '../../../application/taskerRepository'

export type Schema = {
    tasks: Array<TaskDetail>
    worklogs: Array<Worklog>
    jobs: Array<Job>
}
const exampleData :Schema = require('./db/taskerdb.json')

//const adapter = new FileSync<schema>('./db/taskerdb.json')
const adapter = new LocalStorage<Schema>('db')

export const db = lowdb(adapter)

export class LowdbLocalstorageRepository implements TaskerRepository {
    newId(table: string) : string {
        let res: Array<TaskDetail> | Array<Worklog> | Array<Job>
        let id: string 
        switch(table){
            case 'tasks':                
                res = db.get('tasks').orderBy('id','desc').take(1).value()
                id = res.length ? (parseInt(res[0].id) + 1).toString() : '1'
                break
            case 'worklogs':
                res = db.get('worklogs').orderBy('id','desc').take(1).value()
                id = res.length ? (parseInt(res[0].id) + 1).toString() : '1'
                break
            case 'jobs':
                res = db.get('jobs').orderBy('id','desc').take(1).value()
                id = res.length ? (parseInt(res[0].id) + 1).toString() : '1'
                break
            default:
                throw new Error(`La tabla '${table}' no existe`)
        }
        return id
    }

    newDb(): boolean {
        try{
            clearDB()
            return true
        }catch(e){
            return false
        }
    }

    importDb(db: Schema): boolean{        
        try{
            if(hasDB()){
                localStorage.removeItem('db')
            }
            initDB('import',db)
        }catch(e){
            console.log(e)
            return false
        }
    }

    
    exportDb(): FileDownload{
        try{
            const data = localStorage.getItem('db')
            let jsonObject = JSON.stringify(data)
            let exportedFilename = `taskerdb_${new Date().getTime()}.txt`
            
            return {blob: jsonObject, filename: exportedFilename}

        }catch(e){
            throw e
        }
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
            let parentTask = null;
            let childTasks = [];
            childTasks = childTasks.concat(db.get('tasks').filter({parent: id}).value() || []);
            if(task && task.parent !== ''){
                parentTask = db.get('tasks').find({id: task.parent}).value()
            }

            const taskObject : TaskObject= {
                task: task,
                parentTask: parentTask,
                childTasks: childTasks
            }
            console.log("Tarea",taskObject)
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

    getWorklogs(filter: Partial<Worklog> = {}): Array<Worklog>  {
        const search = JSON.parse(filter as string)
        const worklogs = db.get('worklogs').filter(search).value()
        const result : Array<Worklog>= []
        worklogs.map((worklog: Worklog) => {
            result.push({
                id: worklog.id || '',
                title: worklog.title || '',
                createdDate: worklog.createdDate || '',
                startDatetime: worklog.startDatetime || '',
                endDatetime: worklog.endDatetime || '',
                tags: worklog.tags || []
            })
        })
        return result
    }
    getWorklogById(id: string): WorklogObject {    
        try{    
            console.log(id)
            let worklog = db.get('worklogs').find({id: id}).value() || null    
            console.log(worklog)
            let childJobs = [];
            childJobs = childJobs.concat(db.get('jobs').filter({worklog: id}).value() || []);
            

            const WorklogObject : WorklogObject= {
                worklog: worklog,
                childJobs: childJobs
            }
            return WorklogObject
        }catch (e){
            throw e
        }
    }
    addWorklog (worklog: Worklog): WorklogObject{  
        try{      
             db.get('worklogs').push(worklog).write()
             return this.getWorklogById(worklog.id)
        }catch(e){
            throw e
        }
    }

    updateWorklog(worklog: Worklog): WorklogObject{
        try{
            db.get('worklogs').find({id: worklog.id}).assign(worklog).write()
            return this.getWorklogById(worklog.id)
        }catch(e){
            throw e
        }
    }
    deleteWorklog(worklogid: string): boolean{
        try{
            const worklog = db.get('worklogs').find({id: worklogid}).value()
            if(worklog){
                db.get('worklogs').remove({id: worklogid}).write()
            }else{
                return false
            }
            return true
        }catch(e){
            throw e
        }
    }

    getJobs(filter: Partial<Job> = {}): Array<Job>  {
        const search = JSON.parse(filter as string)
        const jobs = db.get('jobs').filter(search).value()
        const result : Array<Job>= []
        jobs.map((job: Job) => {
            result.push({
                id: job.id || '',
                task: job.task || '',
                worklog: job.worklog || '',
                title: job.title || '',
                description: job.description || '',
                startDatetime: job.startDatetime || '',
                endDatetime: job.endDatetime || '',
                type: job.type || '',
                tags: job.tags || []
            })
        })
        return result
    }
    getJobById(id: string): JobObject {    
        try{    
            let job = db.get('jobs').find({id: id}).value() || null    
            let task = null
            let worklog = null
            
            if(job && job.task !== ''){
                task = db.get('tasks').find({id: job.task}).value()
            }

            if(job && job.worklog !== ''){
                worklog = db.get('worklogs').find({id: job.worklog}).value()
            }

            const JobObject : JobObject= {
                job: job,
                worklog: worklog,
                task: task
            }
            return JobObject
        }catch (e){
            throw e
        }
    }
    addJob (job: Job): JobObject{  
        try{      
             db.get('jobs').push(job).write()
             return this.getJobById(job.id)
        }catch(e){
            throw e
        }
    }

    updateJob(job: Job): JobObject{
        try{
            db.get('jobs').find({id: job.id}).assign(job).write()
            return this.getJobById(job.id)
        }catch(e){
            throw e
        }
    }
    deleteJob(jobid: string): boolean{
        try{
            const job = db.get('jobs').find({id: jobid}).value()
            if(job){
                db.get('jobs').remove({id: jobid}).write()
            }else{
                return false
            }
            return true
        }catch(e){
            throw e
        }
    }
}

export const hasDB = (): boolean => {
    if(localStorage.getItem('db') ){
        return true
    }
    return false
}
export const initDB = (type: string = 'empty', dbfile?: Schema) => {
    console.log("INICIANDO",type)
    if(!hasDB()){        
        console.log("DB vacía")
        db.defaults({ tasks: [], worklogs: [], jobs: [] }).write()

        if(type === 'example'){
            loadDataToDB(exampleData)
        }else if(type === 'import'){
            loadDataToDB(dbfile)
        }else if(type === 'empty'){
            // Nothing to do here        
        }else{
            // Nothing to do here
        }
    }else{
        console.log("DB con registros")
    }

    setTaskerRepository(new LowdbLocalstorageRepository())
}

// Es necesario borrar todos los items del objeto lowdb ya que guarda los registros en memoria, por lo que aunque borremos el localstorage
// los volverá a cargar
const clearDB = () => {
    db.get('tasks').remove().write()      
    db.get('worklogs').remove().write()  
    db.get('jobs').remove().write()  
}

const loadDataToDB = (data: Schema) => {
    clearDB()
    const tasks : Array<TaskDetail> = data.tasks
    for(let i=0; i< tasks.length; i++){     
        db.get('tasks').push(tasks[i]).write()
    }        
    const worklogs: Array<Worklog> = data.worklogs
    for(let i=0; i< worklogs.length; i++){      
        db.get('worklogs').push(worklogs[i]).write()
    }     
    const jobs: Array<Job> = data.jobs
    for(let i=0; i< jobs.length; i++){      
        db.get('jobs').push(jobs[i]).write()
    }     
}