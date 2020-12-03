import { rest } from 'msw'
import taskData from './tasks.json'

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
        if(task.length === 1){
            return res(
                ctx.status(200),
                ctx.json(task[0])
            )
        }else if (task.length === 0){
            return res(
                ctx.status(404),
                ctx.json({errMessage: 'La tarea no existe'})
            )
        }       
    })
]