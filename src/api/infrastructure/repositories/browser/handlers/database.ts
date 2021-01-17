import { rest } from 'msw'
import { getTaskerRepository, FileDownload } from '../../../../application/taskerRepository'
import { ApiResponseBuilder } from '../../../../domain/api-response'
import { Schema } from '../browserdb'

export const databaseHandlers = [
    rest.get(process.env.PUBLIC_URL + '/api/db/exists', (req,res,ctx) => {
        try{
            const existsdb: boolean = getTaskerRepository().hasDB()
            return res(
                ctx.status(200),
                ctx.json(ApiResponseBuilder(200,existsdb,false))
            )
        }catch(e){
            return res(
                ctx.status(500),
                ctx.json(ApiResponseBuilder(500,{},true,e.message))
            )
        }
    }),

    rest.get(process.env.PUBLIC_URL + '/api/db/export', (req,res,ctx) => {
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

    rest.post(process.env.PUBLIC_URL + '/api/db/import', (req,res,ctx) => {
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

    rest.post(process.env.PUBLIC_URL + '/api/db/new', (req,res,ctx) => {
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
    }),

    rest.get(process.env.PUBLIC_URL + '/api/db/synced', (req,res,ctx) => {
        try{
            const db: boolean = getTaskerRepository().isDbSynced()
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
    })
]