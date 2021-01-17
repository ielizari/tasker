import { rest } from 'msw'
import { isEmpty } from 'lodash'
import { Job, JobObject } from '../../../../domain/job'
import { getTaskerRepository } from '../../../../application/taskerRepository'
import { ApiResponseBuilder } from '../../../../domain/api-response'
import { mapApiJobToJobDb } from '../../../../application/dtos/dbToApiDto'

export const jobHandlers = [
    rest.post(process.env.PUBLIC_URL + '/api/jobs/add', (req, res,ctx) => {
        try{
            const job: Job  | null = req.body ? req.body as Job : null

            if(isEmpty(job.id)) {
                job.id = getTaskerRepository().newId('jobs')
            }else{
                throw new Error('Un trabajo nuevo no puede contener un valor en el campo "id"')
            }
            
            //job.createdDate = ISOStringToFormatedDate(new Date().toISOString())
            let result = getTaskerRepository().addJob(mapApiJobToJobDb(job))
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
    rest.delete(process.env.PUBLIC_URL + '/api/jobs/delete/:jobid', (req,res,ctx) => {
        try{
            const jobid = req.params.jobid || '';
            if(jobid === ''){
                return res(
                    ctx.status(400),
                    ctx.json(ApiResponseBuilder(400,{},true,'Id de trabajo no válido'))
                )
            }else{            
                let result = getTaskerRepository().deleteJob(jobid)
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

    rest.put(process.env.PUBLIC_URL + '/api/jobs/update', (req, res, ctx) => {
        try{
            const job: Job | null = req.body ? req.body as Job : null
            
            if(isEmpty(job.id)) {
                throw new Error('Es necesario proporcionar el id del trabajo a editar')
            }
                  
            let result: JobObject = getTaskerRepository().updateJob(mapApiJobToJobDb(job))
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