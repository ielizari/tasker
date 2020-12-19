import { rest } from 'msw'
import taskData from './tasks.json'
import { TaskDetail, TaskObject } from '../../domain/task-detail'
import { isEmpty } from 'lodash'
import  {Datepicker}  from '../../lib/orzkDatepicker/datepicker'
import { ApiResponseBuilder, ApiResponse} from '../../api/domain/api-response'

export const handlers = [
    rest.post('http://localhost:3000/api/tasks',(req, res, ctx) => {        
        return res(
            ctx.status(200),
            ctx.json(ApiResponseBuilder(200,taskData,false))
        )
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
            
        
    })
]