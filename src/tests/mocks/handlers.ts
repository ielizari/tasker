import { rest } from 'msw'
import taskData from './tasks.json'
import { TaskDetail, TaskObject } from '../../front/domain/task-detail'
import { Worklog, WorklogObject} from '../../front/domain/worklog'
import { Job, JobObject } from '../../front/domain/job'
import { isEmpty } from 'lodash'
import  {Datepicker}  from '../../lib/orzkDatepicker/datepicker'
import { ApiResponseBuilder, ApiResponse} from '../../api/domain/api-response'

export const handlers = [
    rest.post('http://localhost:3000/api/tasks',(req, res, ctx) => {       
        const filters : Partial<TaskDetail> = req.body ? JSON.parse(req.body as string) : {}
         
        if(filters.title === 'Hacer la compra'){   
            return res(
                ctx.status(200),
                ctx.json(ApiResponseBuilder(200,taskData.tasks.filter((task)=>task.title === filters.title),false))
            )
        }else if(filters.title === 'Tarea que no existe'){
            return res(
                ctx.status(200),
                ctx.json(ApiResponseBuilder(200,[],false))
            )
        }else{ 
            return res(
                ctx.status(200),
                ctx.json(ApiResponseBuilder(200,taskData.tasks,false))
            )
        }
    }),
    // Tarea inexistente
    rest.get('http://localhost:3000/api/tasks/1111',(req, res, ctx) => {  
        return res(
            ctx.status(404, 'La tarea no existe'),
            ctx.json(ApiResponseBuilder(200,{},true,'La tarea no existe'))
        )         
    }),
    rest.get('http://localhost:3000/api/tasks/1',(req, res, ctx) => {          
        const task: TaskDetail = {            
            "id":"1",
            "parent":"",
            "title":"Hacer la compra",
            "description": "Comprar huevos, leche, cebollas",
            "createdDate": "2020-11-10T10:45:01+0200",
            "limitDate": "2020-12-01T10:45+0200",
            "author": "Iñaki",
            "authorId": "1",
            "status": "1",
            "priority": "3",
            "tags": ["compra","casa","comida"]            
        }
        const parentTask = null
        const childTasks = []

        const taskObject : TaskObject= {
            task: task,
            parentTask: parentTask,
            childTasks: childTasks
        }
        
        return res(
            ctx.status(200),
            ctx.json(ApiResponseBuilder(200,taskObject,false))
        )        
    }),
    rest.post('http://localhost:3000/api/tasks/add',(req,res,ctx) =>{
        const task: TaskDetail = req.body as TaskDetail        
        
        task.createdDate = "2000-01-01T00:00:00+0200"
        const taskresponse: TaskObject = {
            task: task,
            childTasks: [],
            parentTask: null
        }
        if(task.description === 'success'){
            return res(
                ctx.status(200),
                ctx.json(ApiResponseBuilder(200,taskresponse,false))
            )
        }else if(task.description == 'error'){
            return res(
                ctx.status(500),
                ctx.json(ApiResponseBuilder(500,taskresponse,true,'Error al crear la tarea'))
            )
        }
        
    }),
    
    rest.put('http://localhost:3000/api/tasks/update', (req, res, ctx) => {
        
        const taskobject: TaskObject = {
            task: null,
            childTasks: [],
            parentTask: null
        }
        taskobject.task = req.body as TaskDetail                                     
        
        return res(                
            ctx.status(200),
            ctx.json(ApiResponseBuilder(200,taskobject,false))            
        )
        
    }),

    rest.delete('http://localhost:3000/api/tasks/delete/1', (req,res,ctx) => {
            const task: TaskDetail = {            
                "id":"1",
                "parent":"",
                "title":"Hacer la compra",
                "description": "Comprar huevos, leche, cebollas",
                "createdDate": "2020-11-10T10:45:01+0200",
                "limitDate": "2020-12-01T10:45:01+0200",
                "author": "Iñaki",
                "authorId": "1",
                "status": "1",
                "priority": "3",
                "tags": ["compra","casa","comida"]            
            }
            
            return res(
                    ctx.status(200),
                    ctx.json(ApiResponseBuilder(200,task,false))
                )
            
        
    }),

    rest.post('http://localhost:3000/api/worklogs',(req, res, ctx) => {       
        const filters : Partial<Worklog> = req.body ? JSON.parse(req.body as string) : {}
        
        if(filters.title === 'Compra 15-11-20'){
            return res(
                ctx.status(200),
                ctx.json(ApiResponseBuilder(200,taskData.worklogs.filter((worklog)=>worklog.title === filters.title),false))
            )
        }else if(filters.title === 'Parte que no existe'){
            return res(
                ctx.status(200),
                ctx.json(ApiResponseBuilder(200,[],false))
            )
        }else{
            return res(
                ctx.status(200),
                ctx.json(ApiResponseBuilder(200,taskData.worklogs,false))
            )        
        }
    }),

    rest.get('http://localhost:3000/api/worklogs/1',(req, res, ctx) => {     
        const worklog: Worklog = {            
            "id":"1",
            "createdDate": "05/11/2020 08:00",
            "startDatetime":"05/11/2020 09:00",
            "endDatetime":"05/11/2020 16:30",
            "title":"Compra 05-11-20",
            "tags": []
        }
        const childJobs: Array<JobObject> = [
            // {
            //     "id":"1",
            //     "worklog":"1",
            //     "task":"1",
            //     "startDatetime":"2020-11-05T08:00:00.000Z",
            //     "endDatetime":"2020-11-05T09:30:00.000Z",
            //     "title":"Carnicería",
            //     "description":"Jamón serrano, pechugas de pollo",
            //     "type":"Análisis",
            //     "tags": ["Jamón serrano", "pechugas de pollo"]
            // },
            // {
            //     "id":"2",
            //     "worklog":"1",
            //     "task":"1",
            //     "startDatetime":"2020-11-05T09:30:00.000Z",
            //     "endDatetime":"2020-11-05T10:30:00.000Z",
            //     "title":"Frutería",
            //     "description":"Manzanas, Plátanos, Mandarinas",
            //     "type":"Análisis",
            //     "tags": ["Manzanas", "Plátanos", "Mandarinas"]
            // }
        ]

        const worklogObject : WorklogObject= {
            worklog: worklog,
            childJobs: childJobs
        }

        return res(
            ctx.status(200),
            ctx.json(ApiResponseBuilder(200,worklogObject,false))
        )        
    }),

    rest.get('http://localhost:3000/api/worklogs/1111',(req, res, ctx) => {  
        return res(
            ctx.status(404, 'El parte no existe'),
            ctx.json(ApiResponseBuilder(200,{},true,'El parte no existe'))
        )         
    }),

    rest.delete('http://localhost:3000/api/worklogs/delete/1', (req,res,ctx) => {
        const worklog: Worklog = {            
            "id":"1",
            "createdDate": "2020-11-05T07:00:00.000Z",
            "startDatetime":"2020-11-05T08:00:00.000Z",
            "endDatetime":"2020-11-05T15:30:00.000Z",
            "title":"Compra 05-11-20",
            "tags": []
        }
        
        return res(
                ctx.status(200),
                ctx.json(ApiResponseBuilder(200,worklog,false))
            )
    }),

    rest.post('http://localhost:3000/api/worklogs/add',(req,res,ctx) =>{
        const worklog: Worklog = req.body as Worklog
        
        worklog.createdDate = "2000-01-01T00:00:00+0200"
        const worklogresponse: WorklogObject = {
            worklog: worklog,
            childJobs: []
        }
        if(worklog.title === 'Parte success'){
            return res(
                ctx.status(200),
                ctx.json(ApiResponseBuilder(200,worklogresponse,false))
            )
        }else if(worklog.title == 'Parte error'){
            return res(
                ctx.status(500),
                ctx.json(ApiResponseBuilder(500,worklog,true,'Error al crear el parte'))
            )
        }        
    }),

    rest.put('http://localhost:3000/api/worklogs/update', (req, res, ctx) => {
        
        const worklogobject: WorklogObject = {
            worklog: null,
            childJobs: [],
        }
        worklogobject.worklog = req.body as Worklog         
        
        return res(                
            ctx.status(200),
            ctx.json(ApiResponseBuilder(200,worklogobject,false))            
        )
        
    }),

    rest.get('http://localhost:3000/api/db/exists', (req, res, ctx) => {
        return res(
            ctx.status(200),
            ctx.json(ApiResponseBuilder(200,true,false))
        )
    })
/*
    rest.get('http://localhost:3000/api/db/export', (req,res,ctx) => {
        try{
            const db: FileDownload = getTaskerRepository().exportDb()
            return res(
                ctx.status(200),
                ctx.json(ApiResponseBuilder(200,db,false))
            )
        }catch(e){
            return res(
                ctx.status(500),
                ctx.json(ApiResponseBuilder(500,{},true,e.message))
            )
        }
    }),

    rest.post('http://localhost:3000/api/db/import', (req,res,ctx) => {
        try{
            const dbfile = req.body ? req.body as Schema: null 
            const db: boolean = getTaskerRepository().importDb(dbfile)
            return res(
                ctx.status(200),
                ctx.json(ApiResponseBuilder(200,db,false))
            )
        }catch(e){
            return res(
                ctx.status(500),
                ctx.json(ApiResponseBuilder(500,{},true,e.message))
            )
        }
    }),

    rest.post('http://localhost:3000/api/db/new', (req,res,ctx) => {
        try{
            const db: boolean = getTaskerRepository().newDb()
            return res(
                ctx.status(200),
                ctx.json(ApiResponseBuilder(200,db,false))
            )
        }catch(e){
            return res(
                ctx.status(500),
                ctx.json(ApiResponseBuilder(500,{},true,e.message))
            )
        }
    })*/
]