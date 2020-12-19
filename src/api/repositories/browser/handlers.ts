import { rest } from 'msw'
import { isEmpty } from 'lodash'
import { getTaskerRepository } from '../../application/taskerRepository'
import { TaskDetail, TaskObject } from '../../../domain/task-detail'
import { Worklog } from '../../../domain/worklog'
import { ApiResponse, ApiResponseBuilder } from '../../domain/api-response'

export const handlers = [
    rest.post('http://localhost:3000/api/tasks',(req, res, ctx) => { 
        const filters = req.body ? req.body as Partial<TaskDetail> : {}  
        console.log("Filtros:",filters)      
        const tasks = getTaskerRepository().getTasks(filters)
        
        const response : ApiResponse = {
            status: 200,
            hasError: false,
            data: tasks
        } 
        return res(
            ctx.status(200),
            ctx.json(response)
        )
    }),
    rest.get('http://localhost:3000/api/tasks/:taskid',(req, res, ctx) => {  
        const taskid = req.params.taskid || '';

        const task = getTaskerRepository().getTaskById(taskid)
        
        if(task.task){            
            return res(
                ctx.status(200),
                ctx.json(ApiResponseBuilder(200,task,false))
            )
        }else{
            return res(
                ctx.status(404, 'La tarea no existe'),
                ctx.json(ApiResponseBuilder(404,{},true,'La tarea no existe'))
            )            
        }
    }),

    rest.post('http://localhost:3000/api/tasks/add',(req,res,ctx) =>{
        try{
            const task: TaskDetail | null = req.body ? req.body as TaskDetail : null

            if(isEmpty(task.id)) {
                task.id = getTaskerRepository().newId('tasks')
            }else{
                throw new Error('Una tarea nueva no puede contener un valor en el campo "id"')
            }
            
            task.createdDate = new Date().toString()
            let result = getTaskerRepository().addTask(task)
            return res(
                ctx.status(200),
                ctx.json(ApiResponseBuilder(200,result,false))
            )
        }catch(e){
            return res(
                ctx.status(500),
                ctx.json(ApiResponseBuilder(500,{},true,e.message))
            )
        }
    }),

    rest.delete('http://localhost:3000/api/tasks/delete/:taskid', (req,res,ctx) => {
        try{
            const taskid = req.params.taskid || '';
            if(taskid === ''){
                return res(
                    ctx.status(400),
                    ctx.json(ApiResponseBuilder(400,{},true,'Id de tarea no válida'))
                )
            }else{            
                let result = getTaskerRepository().deleteTask(taskid)
                return res(
                    ctx.status(200),
                    ctx.json(ApiResponseBuilder(200,result,false))
                )
            }
        }catch(e){
            return res(
                ctx.status(500),
                ctx.json(ApiResponseBuilder(500,{},true,e.message))
            )
        }
    }),

    rest.put('http://localhost:3000/api/tasks/update', (req, res, ctx) => {
        try{
            const task: TaskDetail | null = req.body ? req.body as TaskDetail : null
            if(isEmpty(task.id)) {
                throw new Error('Es necesario proporcionar el id de la tarea a editar')
            }
                        
            let result: TaskObject = getTaskerRepository().updateTask(task)
            return res(
                ctx.status(200),
                ctx.json(ApiResponseBuilder(200,result,false))
            )
        }catch(e){
            return res(
                ctx.status(500),
                ctx.json(ApiResponseBuilder(500,{},true,e.message))
            )
        }
    }),

    rest.post('http://localhost:3000/api/worklogs',(req, res, ctx) => { 
        const filters = req.body ? req.body as Partial<Worklog> : {}  
        const worklogs = getTaskerRepository().getWorklogs(filters)
        
        const response : ApiResponse = {
            status: 200,
            hasError: false,
            data: worklogs
        } 
        return res(
            ctx.status(200),
            ctx.json(response)
        )
    }),
]