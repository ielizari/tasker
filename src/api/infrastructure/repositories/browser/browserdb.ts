import lowdb from 'lowdb'
import LocalStorage from 'lowdb/adapters/LocalStorage'

import { TaskDetail, TaskObject } from '../../../domain/task'
import { WorklogObject, Worklog, WorklogDB} from '../../../domain/worklog'
import { Job, JobObject } from '../../../domain/job'
import { mapWorklogToApiWorklog, mapApiWorklogToWorklogDb, mapApiTaskToTaskDb } from '../../../application/dtos/dbToApiDto'

import { TaskerRepository, setTaskerRepository, FileDownload,  WorklogsFilter, OrderObject  } from '../../../application/taskerRepository'
import { isEmpty } from 'lodash'
import { elapsedTime, ISOStringToFormatedDate } from 'src/lib/date.utils'

export type metadataDB = {
        created: string,
        lastModified: string,
        lastExported: string,    
}

export type Schema = {
    tasks: Array<TaskDetail>
    worklogs: Array<Worklog>
    jobs: Array<Job>
    metadata: Array<metadataDB>
}
const exampleData :Schema = require('./db/taskerdb.json')

const adapter = new LocalStorage<Schema>('db')

export const db = lowdb(adapter)

export class LowdbLocalstorageRepository implements TaskerRepository {
    orderById(input: Array<TaskDetail | Worklog | Job>): Array<TaskDetail | Worklog | Job> {
        return input.sort((a,b) => {
            if(parseInt(a.id) > parseInt(b.id)){
                return 1
            }else return -1
        })
    }
    newId(table: string) : string {
        let res: Array<TaskDetail> | Array<Worklog> | Array<Job>
        let id: string 
        switch(table){
            case 'tasks':
                res = this.orderById(db.get('tasks').value()) as Array<TaskDetail>                
                id = res.length ? (parseInt(res[res.length-1].id)+1).toString() : '1'
                break
            case 'worklogs':               
                res = this.orderById(db.get('worklogs').value()) as Array<Worklog>                
                id = res.length ? (parseInt(res[res.length-1].id)+1).toString() : '1'
                break
            case 'jobs':
                res = this.orderById(db.get('jobs').value()) as Array<Job>                
                id = res.length ? (parseInt(res[res.length-1].id)+1).toString() : '1'
                break
            default:
                throw new Error(`La tabla '${table}' no existe`)
        }
        return id
    }

    newDb(): boolean {
        try{
            this.clearDB()
            this.initDB('empty')
            return true
        }catch(e){
            return false
        }
    }

    importDb(db: Schema): boolean{        
        try{
            if(this.hasDB()){
                localStorage.removeItem('db')
            }
            this.initDB('import',db)
        }catch(e){
            console.log(e)
            return false
        }
    }

    
    exportDb(): FileDownload{
        let lastExportedDate = ''
        try{            
            lastExportedDate = db.get('metadata').value()[0].lastExported
            this.setDbLastExported()
            const data = localStorage.getItem('db')

            let jsonObject = JSON.stringify(data)
            let exportedFilename = `taskerdb_${new Date().getTime()}.txt`            
            
            return {blob: jsonObject, filename: exportedFilename}

        }catch(e){
            this.setDbLastExported(lastExportedDate)
            throw e
        }
    }

    getTasks(filter: Partial<TaskDetail> = {}, order = [], orderDirection = []): Array<TaskObject>  {
        let search = JSON.parse(filter as string)
        const tasks = db.get('tasks').filter(task => 
            ((!search.parent && !(typeof(search.parent)==='string')) || task.parent === search.parent )&&
            (!search.title || task.title.toLowerCase().includes(search.title.toLowerCase()))
        )
        .orderBy(order,orderDirection)
        .value()
        
        const result : Array<TaskObject>= []
        tasks.forEach((task: TaskDetail) => {
            let taskobject: TaskObject = {
                task: task,
                parentTask: null,
                childTasks: []
            }
            if(!isEmpty(task.parent)){
                taskobject.parentTask = db.get('tasks').find({id: task.parent}).value() || null
            }
            taskobject.childTasks = taskobject.childTasks.concat(db.get('tasks').filter({parent: task.id}).value() || []);
            
            result.push(taskobject)
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
            return taskObject
        }catch (e){
            throw e
        }
    }
    addTask (task: TaskDetail): TaskObject{  
        try{      
             db.get('tasks').push(mapApiTaskToTaskDb(task)).write()
             this.setDbLastModified()
             return this.getTaskById(task.id)
        }catch(e){
            throw e
        }
    }

    updateTask(task: TaskDetail): TaskObject{
        try{
            db.get('tasks').find({id: task.id}).assign(mapApiTaskToTaskDb(task)).write()
            this.setDbLastModified()
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
                this.setDbLastModified()
            }else{
                return false
            }
            return true
        }catch(e){
            throw e
        }
    }

    getOrderByItems = (order: OrderObject) => {
        let orderFields = []
        let orderDirections = []
        if(order.orderByFields){
            orderFields = order.orderByFields
            if(order.orderDirections){
                orderDirections = order.orderDirections
            }else{
                for(let i=0; i<orderFields.length; i++){
                    orderDirections.push('asc')
                }
            }
        }
        
        let result = {
            orderFields: orderFields,
            orderDirections: orderDirections
        }
        return result
    }
    getWorklogs(filter: WorklogsFilter): Array<Worklog>  {
        const search = JSON.parse(filter as string) as WorklogsFilter
        const where: Partial<Worklog> = search.where ? search.where : {}
        const order: OrderObject = search.order ? search.order : {}

        const {orderFields, orderDirections} = this.getOrderByItems(order)

        
        const worklogs = db.get('worklogs').filter(wl => 
            (!where.title || wl.title.toLowerCase().includes(where.title.toLowerCase())) &&
            ((!where.endDatetime && !(typeof(where.endDatetime)==='string')) || wl.endDatetime === where.endDatetime)
            //(!search.endDatetime && isEmpty(search.endDatetime) && wl.endDatetime === search.endDatetime)
        )
        .orderBy(orderFields,orderDirections)
        .value()
        const result : Array<Worklog>= []
        worklogs.forEach((worklog: Worklog) => {
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
            let worklog : Worklog = mapWorklogToApiWorklog(db.get('worklogs').find({id: id}).value()) || null  
            let childJobs = [];
            //childJobs = childJobs.concat(db.get('jobs').filter({worklog: id}).value() || []);
            childJobs = this.getJobs({worklog: id})

            const worklogObject : WorklogObject= {
                worklog: worklog,
                childJobs: childJobs
            }
            console.log(worklogObject)
            return worklogObject
        }catch (e){
            throw e
        }
    }
    addWorklog (worklog: Worklog): WorklogObject{  
        try{   
             let wl: WorklogDB = mapApiWorklogToWorklogDb(worklog) 
             db.get('worklogs').push(wl).write()
             this.setDbLastModified()
             return this.getWorklogById(wl.id)
        }catch(e){
            throw e
        }
    }

    updateWorklog(worklog: Worklog): WorklogObject{
        try{
            db.get('worklogs').find({id: worklog.id}).assign(mapApiWorklogToWorklogDb(worklog)).write()
            this.setDbLastModified()
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
                db.get('jobs').remove({worklog: worklogid}).write()
                this.setDbLastModified()
            }else{
                return false
            }
            return true
        }catch(e){
            throw e
        }
    }

    closeWorklog(worklog: Worklog): WorklogObject {
        try{
            worklog = mapApiWorklogToWorklogDb(worklog)
            let runningJob = db.get('jobs').find({worklog: worklog.id, endDatetime: ''}).value()
            if(runningJob){
                runningJob.endDatetime = worklog.endDatetime
                db.get('jobs').find({id: runningJob.id}).assign(runningJob).write()
            }

            db.get('worklogs').find({id: worklog.id}).assign(worklog).write()

            return this.getWorklogById(worklog.id)
        }catch(e){
            throw e
        }
    }

    reopenWorklog(worklog: Worklog): WorklogObject {
        try{
            db.get('worklogs').find({id: worklog.id}).assign(mapApiWorklogToWorklogDb(worklog)).write()
            
            return this.getWorklogById(worklog.id)
        }catch(e){
            throw e
        }
    }

    getWorklogGroupedData(worklogid: string): any {
        try{
            let result : TaskTreeItem = emptyTaskTree()
            let jobs = db.get('jobs').filter({worklog: worklogid}).value()            
            jobs.forEach((job: Job) => {
                let timeInSeconds = job.endDatetime ? 
                    elapsedTime( 
                        ISOStringToFormatedDate(job.startDatetime),
                        ISOStringToFormatedDate(job.endDatetime)
                    )/1000
                : 0                
                
                if(job.task){
                    result = mergeTaskTrees(getTaskTree(job.task,timeInSeconds,job),result)
                }else{
                    result.jobs.push(job)
                    if(job.endDatetime === ''){
                        result.hasRunningJob = true
                    }
                }
                result.timeInSeconds += timeInSeconds
            })
            return result            
        }catch(e){
            throw e
        }
    }

    getTaskGroupedData(id: string): any {
        try{
            //let tree = getDirectChildTasksTree(id)
            let tree = getChildTasksTree(id)
            return tree
        }catch(e){
            throw e
        }
    }

    getJobs(filter: Partial<Job> = {}): Array<JobObject>  {
        let search = {}
        if(typeof filter === 'string'){
            search = JSON.parse(filter as string)
        }else{
            search = filter
        }
        const jobs = db.get('jobs').filter(search).value()
        const result : Array<JobObject>= []
        jobs.forEach((job: Job) => {
            let jobobject: JobObject = {
                job: job,
                task: null,
                worklog: null
            }
            if(!isEmpty(job.task)){
                jobobject.task = db.get('tasks').find({id: job.task}).value() || null
            }

            if(!isEmpty(job.worklog)){
                jobobject.worklog = db.get('worklogs').find({id: job.worklog}).value() || null
            }
            result.push(jobobject)
            // result.push({
            //     id: job.id || '',
            //     task: job.task || '',
            //     worklog: job.worklog || '',
            //     title: job.title || '',
            //     description: job.description || '',
            //     startDatetime: job.startDatetime || '',
            //     endDatetime: job.endDatetime || '',
            //     type: job.type || '',
            //     tags: job.tags || []
            // })
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
            let jobs: Array<JobObject> = this.getJobs({worklog: job.worklog})
            checkOverlappingJobs(job,jobs)

            let runningJobs = db.get('jobs').filter({worklog: job.worklog, endDatetime: ''}).value()
            runningJobs.forEach((item) => {
                item.endDatetime = job.startDatetime
                db.get('jobs').find({id: item.id}).assign(item).write()
            })
            db.get('jobs').push(job).write()

            this.setDbLastModified()
            return this.getJobById(job.id)
        }catch(e){
            throw e
        }
    }

    updateJob(job: Job): JobObject{
        try{
            let jobs: Array<JobObject> = this.getJobs({worklog: job.worklog})
            checkOverlappingJobs(job,jobs)
            db.get('jobs').find({id: job.id}).assign(job).write()
            this.setDbLastModified()
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
                this.setDbLastModified()
            }else{
                return false
            }
            return true
        }catch(e){
            throw e
        }
    }

    hasDB = (): boolean => {
        if(localStorage.getItem('db') && db.get('metadata').value() && db.get('metadata').value().length ){
            return true
        }
        return false
    }

    initDB = (type: string = 'default', dbfile?: Schema) => {
        if(!this.hasDB()){        
            console.log("DB vacía")
            
            db.defaults({ tasks: [], worklogs: [], jobs: [], metadata: [] }).write()
    
            if(type === 'example'){
                this.loadDataToDB(exampleData)
            }else if(type === 'import'){
                this.loadDataToDB(dbfile)
            }else if(type === 'empty'){
                this.loadDataToDB(this.emptyDbObject())
            }else{
                // Nothing to do here
            }
        }else{
            console.log("DB con registros")
        }  
    }
    
    emptyDbObject = () : Schema => {
        let now = new Date().toISOString()
        let metadata : metadataDB = {created: now, lastModified: '', lastExported: ''}
    
        return {
            tasks: [],
            worklogs: [],
            jobs: [],
            metadata: [metadata]
        }
    }

    setDbLastModified = (date: string = ''): boolean => {
        try{
            if(date === ''){
                date = new Date().toISOString()
            }
            const metadata = db.get('metadata').value()
            if(metadata.length){
                let md = metadata[0]
                md.lastModified = date;
                console.log(metadata)
                db.get('metadata').find().assign(md).write()
                //metadata[0].assign(md).write()
                return true
            }
            return false
        }catch(e){
            throw e
        }
    }

    setDbLastExported = (date: string = ''): boolean => {
        try{
            if(date === ''){
                date = new Date().toISOString()
            }
            const metadata = db.get('metadata').value()
            if(metadata.length){
                let md = metadata[0]
                md.lastExported = date;
                db.get('metadata').find().assign(md).write()
                return true
            }
            return false
        }catch(e){
            throw e
        }
    }

    isDbSynced = () : boolean => {
        try{
            let metadata = db.get('metadata').value()
            let lastModified = metadata[0].lastModified
            let lastExported = metadata[0].lastExported

            if(isEmpty(lastModified)){
                return true
            }else if(isEmpty(lastExported)){
                return false
            }else {
                if(new Date(Date.parse(lastModified)) > new Date(Date.parse(lastExported))){
                    return false
                }else{
                    return true
                }
            }
        }catch(e){
            throw e
        }
    }

    // Es necesario borrar todos los items del objeto lowdb ya que guarda los registros en memoria, por lo que aunque borremos el localstorage
    // los volverá a cargar
    clearDB = () => {
        db.get('tasks').remove().write()      
        db.get('worklogs').remove().write()  
        db.get('jobs').remove().write()
        db.get('metadata').remove().write()
    }
    
    loadDataToDB = (data: Schema) => {
        this.clearDB()
        console.log(data)
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
        const metadata : Array<metadataDB> = data.metadata
        for(let i=0; i<metadata.length; i++){
            db.get('metadata').push(metadata[i]).write()
        }
        
    }
}

export const startDb = () => {
    setTaskerRepository(new LowdbLocalstorageRepository())
}

interface TaskTreeItem {
    id: string,
    title: string,
    timeInSeconds: number,
    hasRunningJob: boolean,
    jobs: Array<Job>,
    childTasks: Array<TaskTreeItem>
}
const getTaskTree = (taskid: string, time: number, job: Job = null, childTask: TaskTreeItem = null): TaskTreeItem => {
    try{
        let result : TaskTreeItem
        let root : TaskTreeItem = emptyTaskTree()
        let task: TaskDetail = db.get('tasks').find({id: taskid}).value()
        let hasRunningJob = false
        if(job){
            if(job.endDatetime === ''){
                hasRunningJob = true
            }
        }else{
            if(childTask &&   childTask.hasRunningJob === true){
                hasRunningJob = true
            }
        }
        result = {
            id: task.id, 
            title: task.title, 
            timeInSeconds: time,
            hasRunningJob: hasRunningJob,
            jobs: job ? [job] : [],
            childTasks: childTask ? [childTask] : []
        }
        if(!isEmpty(task.parent)){
            let parent: TaskTreeItem = getTaskTree(task.parent,time,null,result) 
            return parent
        }else{   
            root.childTasks.push(result)
            root.hasRunningJob = result.hasRunningJob    
            return root
        }
    }catch(e){
        throw e
    }
}

const mergeTaskTrees = (source: TaskTreeItem, target: TaskTreeItem): TaskTreeItem =>{    
    if(!hasChildTasks(target) && hasChildTasks(source)){
            target.jobs = target.jobs.concat(source.jobs)
            target.hasRunningJob = source.hasRunningJob || target.hasRunningJob
            target.childTasks = source.childTasks
            return target
    }else if( !hasChildTasks(source) ){
            target.jobs = target.jobs.concat(source.jobs)
            target.hasRunningJob = source.hasRunningJob || target.hasRunningJob
            target.timeInSeconds += source.timeInSeconds
            return target        
    }else{
        let commonChilds = itemsPresentInBoth(source,target)
        let missingChilds = itemsMissingInTarget(source,target)

        target.childTasks.forEach(targetItem => {
            let inCommon = commonChilds.filter(commonItem => targetItem.id === commonItem[0].id)
            if(inCommon.length === 1){
                targetItem = mergeTaskTrees(inCommon[0][0],inCommon[0][1])
            }else{
                if(inCommon.length > 0){
                    console.log("Error: No debería haber más de un item en común", inCommon)
                }
            }
        })

        missingChilds.forEach(item => {
            target.childTasks.push(item)
        })
       
        target.jobs = target.jobs.concat(source.jobs)
        target.hasRunningJob = source.hasRunningJob || target.hasRunningJob
        target.timeInSeconds += source.timeInSeconds
        return target
    }
}

const hasChildTasks = (item: TaskTreeItem): boolean => {
    if(item.childTasks.length > 0){
        return true
    }
    return false
}

const emptyTaskTree = () : TaskTreeItem => {
    return {id: '0', title: 'root', timeInSeconds: 0, hasRunningJob: false, jobs: [], childTasks: []}
}

const itemsPresentInBoth = (source: TaskTreeItem, target: TaskTreeItem) : Array<Array<TaskTreeItem>> => {
    let result: Array<Array<TaskTreeItem>> = []
    let mergedIds: Array<string> = []
    let merge = source.childTasks.concat(target.childTasks)
    
    merge.forEach(item => {
        let commonItems = merge.filter(mergeItem => mergeItem.id === item.id)
        if(commonItems.length === 2){
            if(!mergedIds.includes(item.id)){
                mergedIds.push(item.id)
                result.push(commonItems)
            }            
        }else{
            if(commonItems.length !== 1){
                console.log("Error: no debería haber más de un item con el mismo id en un nodo", commonItems)
            }
        }
    })
    
    return result
}

const itemsMissingInTarget = (source: TaskTreeItem, target: TaskTreeItem): Array<TaskTreeItem> => {
    let result: Array<TaskTreeItem> = []
    source.childTasks.forEach(sourceItem => {
        if(target.childTasks.filter(targetItem => sourceItem.id === targetItem.id).length === 0){
            result.push(sourceItem)
        }
    })
    
    return result
}

const checkOverlappingJobs = (job: Job, jobs: Array<JobObject>): boolean => {
    let overlappingJobs = jobs.filter(jobItem => {
        if(jobItem.job.id === job.id){
            return false
        }
        if(job.endDatetime !== ''){
            if( job.startDatetime < jobItem.job.endDatetime && 
                job.endDatetime > jobItem.job.startDatetime 
            ){
                return true
            }
        }else{
            if(job.startDatetime < jobItem.job.endDatetime){
                return true
            }
        }
        return false
    })

    if(overlappingJobs.length > 0){
        console.log(overlappingJobs)
        throw new Error(`El intervalo de tiempo de este trabajo se solapa con uno ya existente: 
            ${overlappingJobs[0].job.title || 'Sin título'}, 
            ${overlappingJobs[0].task ? overlappingJobs[0].task.title : 'Sin tarea'}, 
            ${ISOStringToFormatedDate(overlappingJobs[0].job.startDatetime)},
            ${ISOStringToFormatedDate(overlappingJobs[0].job.endDatetime)}`)
    }

    return false
}

const getChildTasksTree = (taskid: string): TaskTreeItem => {
    let childs = db.get('tasks').filter({parent: taskid}).value()
    let jobs = db.get('jobs').filter({task: taskid}).value()
    let task = db.get('tasks').find({id: taskid}).value()

    let result = emptyTaskTree()
    result.id = taskid
    result.title = task.title
    result.jobs = jobs

    jobs.forEach(job => {
        if(!job.endDatetime){
            result.hasRunningJob = true
        }
        result.timeInSeconds += job.endDatetime ?
            elapsedTime(
                ISOStringToFormatedDate(job.startDatetime),
                ISOStringToFormatedDate(job.endDatetime)
            )/1000
        : 0
    })

    childs.forEach(child => {
        let childTask = getChildTasksTree(child.id)
        if(childTask.hasRunningJob){
            result.hasRunningJob = true
        }
        result.childTasks.push(childTask)
        result.timeInSeconds += childTask.timeInSeconds
    })
    return result
}

const getDirectChildTasksTree = (taskid: string): TaskTreeItem => {
    let childs = db.get('tasks').filter({parent: taskid}).value()
    let jobs = db.get('jobs').filter({task: taskid}).value()
    let task = db.get('tasks').find({id: taskid}).value()

    let result = emptyTaskTree()
    result.id = taskid
    result.title = task.title
    result.jobs = jobs

    jobs.forEach(job => {
        if(!job.endDatetime){
            result.hasRunningJob = true
        }
        result.timeInSeconds += job.endDatetime ? 
            elapsedTime(
                ISOStringToFormatedDate(job.startDatetime),
                ISOStringToFormatedDate(job.endDatetime)
            )/1000
        : 0
    })

    childs.forEach(child => {
        let childIds = getAllChildTasksIds(child.id)
        let childJobs = db.get('jobs').filter((v) => childIds.includes(v.task)).value()
        let childObject = emptyTaskTree()
        childObject.id = child.id
        childObject.title = child.title

        childJobs.forEach(job => {
            if(!job.endDatetime){
                childObject.hasRunningJob = true
                result.hasRunningJob = true
            }
            childObject.timeInSeconds += job.endDatetime ? 
                elapsedTime( 
                    ISOStringToFormatedDate(job.startDatetime),
                    ISOStringToFormatedDate(job.endDatetime)
                )/1000
            : 0
        })
        result.timeInSeconds += childObject.timeInSeconds
        result.childTasks.push(childObject)
    })
    return result
}

const getAllChildTasksIds = (taskid: string): Array<string> => {
    let childs = db.get('tasks').filter({parent: taskid}).value()
    let result = []

    childs.forEach(child => {
        result.push(child.id)
        result.concat(getAllChildTasksIds(child.id))
    })

    return result
}