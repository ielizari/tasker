import { rest } from 'msw'
import { isEmpty } from 'lodash'
import { Worklog, WorklogObject, WorklogsFilter } from '../../../../domain/worklog'
import { getTaskerRepository } from '../../../../application/taskerRepository'
import { ApiResponse, ApiResponseBuilder } from '../../../../domain/api-response'
import { ISOStringToFormatedDate } from '../../../../../lib/date.utils'

export const worklogHandlers = [
    rest.post(process.env.PUBLIC_URL + '/api/worklogs',(req, res, ctx) => { 
        const filters = req.body ? req.body as WorklogsFilter : {}         
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

    rest.get(process.env.PUBLIC_URL + '/api/worklogs/:worklogid',(req, res, ctx) => {  
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

    rest.post(process.env.PUBLIC_URL + '/api/worklogs/add',(req,res,ctx) =>{
        try{
            const worklog: Worklog | null = req.body ? req.body as Worklog : null

            if(isEmpty(worklog.id)) {
                worklog.id = getTaskerRepository().newId('worklogs')
            }else{
                throw new Error('Un parte nuevo no puede contener un valor en el campo "id"')
            }
            
            worklog.createdDate = ISOStringToFormatedDate(new Date().toISOString())
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

    rest.delete(process.env.PUBLIC_URL + '/api/worklogs/delete/:worklogid', (req,res,ctx) => {
        try{
            const worklogid = req.params.worklogid || '';
            if(worklogid === ''){
                return res(
                    ctx.status(400),
                    ctx.json(ApiResponseBuilder(400,{},true,'Id de parte no válido'))
                )
            }else{            
                let result = getTaskerRepository().deleteWorklog(worklogid)
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

    rest.put(process.env.PUBLIC_URL + '/api/worklogs/update', (req, res, ctx) => {
        try{
            const worklog: Worklog | null = req.body ? req.body as Worklog : null
            
            if(isEmpty(worklog.id)) {
                throw new Error('Es necesario proporcionar el id del parte a editar')
            }
                  
            let result: WorklogObject = getTaskerRepository().updateWorklog(worklog)
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

    rest.put(process.env.PUBLIC_URL + '/api/worklogs/close', (req, res, ctx) => {
        try{
            const worklog: Worklog | null = req.body ? req.body as Worklog : null
            
            if(isEmpty(worklog.id)) {
                throw new Error('Es necesario proporcionar el id del parte a cerrar')
            }
                  
            let result: WorklogObject = getTaskerRepository().closeWorklog(worklog)
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

    rest.put(process.env.PUBLIC_URL + '/api/worklogs/reopen', (req, res, ctx) => {
        try{
            const worklog: Worklog | null = req.body ? req.body as Worklog : null
            
            if(isEmpty(worklog.id)) {
                throw new Error('Es necesario proporcionar el id del parte a cerrar')
            }
                  
            let result: WorklogObject = getTaskerRepository().reopenWorklog(worklog)
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

    rest.get(process.env.PUBLIC_URL + '/api/worklogs/:worklogid/grouped',(req,res,ctx) =>{
        try{            
            const worklogid = req.params.worklogid || '';
            if(worklogid !== ''){
                let result = getTaskerRepository().getWorklogGroupedData(worklogid)
                return res(
                    ctx.status(200),
                    ctx.json(ApiResponseBuilder(200,result,false))
                )
            }else{
                return res(
                    ctx.status(400),
                    ctx.json(ApiResponseBuilder(400,{},true,'Id de parte no válido'))
                )
            }
        }catch(e){
            return res(
                ctx.status(500),
                ctx.json(ApiResponseBuilder(500,{},true,e.message))
            )
        }
    }),
    
] 