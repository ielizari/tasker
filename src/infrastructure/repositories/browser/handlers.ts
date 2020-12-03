import { rest } from 'msw'
import { LowdbLocalstorageRepository } from './browserdb'

export const handlers = [
    rest.get('http://localhost:3000/api/tasks',(req, res, ctx) => {  
        const repository = new LowdbLocalstorageRepository()
        const tasks = repository.getTasks()
        console.log(tasks)
        return res(
            ctx.status(200),
            ctx.json(tasks)
        )
    }),
    rest.get('http://localhost:3000/api/tasks/:taskid',(req, res, ctx) => {  
        const taskid = req.params.taskid || '';
        const repository = new LowdbLocalstorageRepository()

        const task = repository.getTaskById(taskid)
        if(task !== undefined){
            return res(
                ctx.status(200),
                ctx.json(task)
            )
        }else{
            return res(
                ctx.status(404, 'La tarea no existe'),
                ctx.json({errMessage: 'La tarea no existe'})
            )            
        }
    })
]