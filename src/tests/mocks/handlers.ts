import { rest } from 'msw'
import taskData from './tasks.json'
import { TaskDetail, TaskObject } from '../../domain/task-detail'
import { isEmpty } from 'lodash'
import  {Datepicker}  from '../../lib/orzkDatepicker/datepicker'
import { ApiResponseBuilder, ApiResponse} from '../../api/domain/api-response'

export const handlers = [
    rest.get('http://localhost:3000/api/tasks',(req, res, ctx) => {        
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
            "limitDate": "",
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
        try{
            const task: TaskDetail | null = req.body ? req.body as TaskDetail : null

            let lastid = taskData.sort((a,b)=>{
                if(a.id > b.id) return 1
                else return -1
            })[0].id

            if(isEmpty(task.id)) {
                task.id = lastid? (parseInt(lastid)+1).toString() : '1'
            }

            //let dp = new Datepicker()
            //dp.setDate(new Date())
            //task.createdDate = dp.getFullDateString()
            task.createdDate = new Date().toString()
            
            return res(
                ctx.status(200),
                ctx.json(task)
            )
        }catch(e){
            return res(
                ctx.status(500),
                ctx.json({errMessage: e.message})
            )
        }
    }),

    rest.delete('http://localhost:3000/api/tasks/delete/1', (req,res,ctx) => {
            const task: TaskDetail = {            
                "id":"1",
                "parent":"",
                "title":"Hacer la compra",
                "description": "Comprar huevos, leche, cebollas",
                "createdDate": "2020-11-10T10:45:01+0200",
                "limitDate": "",
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