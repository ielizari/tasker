import { rest } from 'msw'
import taskData from './tasks.json'
import { TaskDetail } from '../../domain/task-detail'
import { isEmpty } from 'lodash'
import  {Datepicker}  from '../../lib/orzkDatepicker/datepicker'

export const handlers = [
    rest.get('http://localhost:3000/api/tasks',(req, res, ctx) => {        
        return res(
            ctx.status(200),
            ctx.json(taskData)
        )
    }),
    rest.get('http://localhost:3000/api/tasks/:taskid',(req, res, ctx) => {  
        const taskid = req.params.taskid || '';        
        const task = taskData.filter((item)=> item.id === taskid)  

        if(task.length){
            return res(
                ctx.status(200),
                ctx.json(task[0])
            )
        }else{
            return res(
                ctx.status(404, 'La tarea no existe'),
                ctx.json({errMessage: 'La tarea no existe'})
            )            
        }
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
    })
]