import { rest } from 'msw'
import { isEmpty, throttle } from 'lodash'
import { Worklog } from '../../../../../front/domain/worklog'
import { getTaskerRepository, FileDownload } from '../../../../application/taskerRepository'
import { ApiResponse, ApiResponseBuilder } from '../../../../domain/api-response'

export const worklogHandlers = [
    rest.post('http://localhost:3000/api/worklogs',(req, res, ctx) => { 
        const filters = req.body ? req.body as Partial<Worklog> : {}  
        const worklogs : Array<Worklog> = getTaskerRepository().getWorklogs(filters)
        
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

    rest.get('http://localhost:3000/api/worklogs/:worklogid',(req, res, ctx) => {  
        const worklogid = req.params.worklogid || '';

        const worklog = getTaskerRepository().getWorklogById(worklogid)
        
        if(worklog.worklog){            
            return res(
                ctx.status(200),
                ctx.json(ApiResponseBuilder(200,worklog,false))
            )
        }else{
            return res(
                ctx.status(404, 'El parte no existe'),
                ctx.json(ApiResponseBuilder(404,{},true,'El parte no existe'))
            )            
        }
    }),

    rest.post('http://localhost:3000/api/worklogs/add',(req,res,ctx) =>{
        try{
            const worklog: Worklog | null = req.body ? req.body as Worklog : null

            if(isEmpty(worklog.id)) {
                worklog.id = getTaskerRepository().newId('worklogs')
            }else{
                throw new Error('Un parte nuevo no puede contener un valor en el campo "id"')
            }
            return res(
                ctx.status(500),
                ctx.json(ApiResponseBuilder(500,{},true,"ni de coña"))
            )
            worklog.createdDate = new Date().toString()
            let result = getTaskerRepository().addWorklog(worklog)
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
] 