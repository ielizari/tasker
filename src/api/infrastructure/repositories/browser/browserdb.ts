import lowdb from 'lowdb'
import LocalStorage from 'lowdb/adapters/LocalStorage'

import { TaskDetail, TaskObject, TaskDB } from 'src/api/domain/task'
import { WorklogObject, Worklog, WorklogDB} from 'src/api/domain/worklog'
import { Job, JobObject } from 'src/api/domain/job'
import { Calendar, CalendarDB, CalendarTime, CalendarNonWorkingTypes, CalendarDayJobs } from 'src/api/domain/calendar'
import { mapWorklogToApiWorklog, mapApiWorklogToWorklogDb, mapApiTaskToTaskDb, mapTaskDbToApiTask } from 'src/api/application/dtos/dbToApiDto'

import { TaskerRepository, setTaskerRepository, FileDownload,  WorklogsFilter, OrderObject  } from 'src/api/application/taskerRepository'
import { isEmpty } from 'lodash'
import { elapsedTime, ISOStringToFormatedDate } from 'src/lib/date.utils'
import { CalendarsFilter } from 'src/front/domain/calendar'

export type metadataDB = {
    created: string,
    lastModified: string,
    lastExported: string,
}

export type Schema = {
    tasks: Array<TaskDB>
    worklogs: Array<Worklog>
    jobs: Array<Job>
    calendars?: Array<Calendar>
    metadata: Array<metadataDB>
}
const exampleData :Schema = require('./db/taskerdb.json')

const adapter = new LocalStorage<Schema>('db')

export const db = lowdb(adapter)

export class LowdbLocalstorageRepository implements TaskerRepository {
    orderById(input: Array<TaskDB | Worklog | Job | Calendar>): Array<TaskDB | Worklog | Job | Calendar> {
        return input?.sort((a,b) => {
            if(parseInt(a.id) > parseInt(b.id)){
                return 1
            }else return -1
        }) || []
    }
    newId(table: string) : string {
        let res: Array<TaskDB> | Array<Worklog> | Array<Job> | Array<Calendar>
        let id: string
        switch(table){
            case 'tasks':
                res = this.orderById(db.get('tasks').value()) as Array<TaskDB>
                id = res.length ? (parseInt(res[res.length-1].id)+1).toString() : '1'
                break
            case 'worklogs':
                res = this.orderById(db.get('worklogs').value()) as Array<Worklog>
                id = res.length ? (parseInt(res[res.length-1].id)+1).toString() : '1'
                break
            case 'jobs':
                res = this.orderById(db.get('jobs').value()) as Array<Job>
                id = res.length ? (parseInt(res[res.length-1].id)+1).toString() : '1'
                break
            case 'calendars':
                res = this.orderById(db.get('calendars').value()) as Array<Calendar>
                id = res.length ? (parseInt(res[res.length-1].id)+1).toString() : '1'
                break
            default:
                throw new Error(`La tabla '${table}' no existe`)
        }
        return id
    }

    newDb(): boolean {
        try{
            this.clearDB()
            this.initDB('empty')
            return true
        }catch(e){
            return false
        }
    }

    importDb(db: Schema): boolean{
        try{
            if(this.hasDB()){
                localStorage.removeItem('db')
            }
            this.initDB('import',db)
        }catch(e){
            console.error('importdb', e)
            return false
        }
    }


    exportDb(): FileDownload{
        let lastExportedDate = ''
        try{
            lastExportedDate = db.get('metadata').value()[0].lastExported
            this.setDbLastExported()
            const data = localStorage.getItem('db')

            let jsonObject = JSON.stringify(data)
            let exportedFilename = `taskerdb_${new Date().getTime()}.txt`

            return {blob: jsonObject, filename: exportedFilename}

        }catch(e){
            this.setDbLastExported(lastExportedDate)
            throw e
        }
    }

    getTasks(filter: Partial<TaskDetail> = {}, order = [], orderDirection = []): Array<TaskObject>  {
        let search = JSON.parse(filter as string)
        const tasks: Array<TaskDetail> = db.get('tasks').filter(task =>
            ((!search.parent && !(typeof(search.parent)==='string')) || task.parent === search.parent )&&
            (!search.title || task.title.toLowerCase().includes(search.title.toLowerCase()))
        ).map(mapTaskDbToApiTask)

        .orderBy(order,orderDirection)
        .value()

        const result : Array<TaskObject>= []
        tasks.forEach((task: TaskDetail) => {
            let taskobject: TaskObject = {
                task: task,
                parentTask: null,
                childTasks: [],
                calendars: [],
            }
            if(!isEmpty(task.parent)){
                taskobject.parentTask = mapTaskDbToApiTask(db.get('tasks').find({id: task.parent}).value()) || null
            }
            taskobject.childTasks = taskobject.childTasks.concat(
                db.get('tasks').filter({parent: task.id}).map(mapTaskDbToApiTask).value() || []);

            result.push(taskobject)
        })
        return result
    }
    getTaskById(id: string): TaskObject {
      try{
        const task = mapTaskDbToApiTask(db.get('tasks').find({id: id}).value()) || null
        let parentTask: TaskDetail | null = null;
        let childTasks: Array<TaskDetail> = [];
        childTasks = childTasks.concat(db.get('tasks').filter({parent: id}).map(mapTaskDbToApiTask).value() || []);
        if(task && task.parent !== ''){
          parentTask = mapTaskDbToApiTask(db.get('tasks').find({id: task.parent}).value())
        }

        const taskObject : TaskObject= {
          task: task,
          parentTask: parentTask,
          childTasks: childTasks,
          calendars: task.calendars,
        }
        return taskObject
      }catch (e){
        throw e
      }
    }
    getTaskCalendars(task: TaskDB) : Array<Calendar> {
      let calendars: Array<Calendar> = task.calendars?.map((calendarid) => {
        return db.get('calendars').find({id: calendarid}).value()
      }).filter(Boolean) || [];

      if(task.parent) {
        const parentTask = db.get('tasks').find({id: task.parent}).value()
        calendars = calendars.concat(this.getTaskCalendars(parentTask))
      }

      return calendars;
    }
    addTask (task: TaskDetail): TaskObject{
      try{
        db.get('tasks').push(mapApiTaskToTaskDb(task)).write()
        this.setDbLastModified()
        return this.getTaskById(task.id)
      }catch(e){
        throw e
      }
    }

    updateTask(task: TaskDetail): TaskObject{
      try{
        db.get('tasks').find({id: task.id}).assign(mapApiTaskToTaskDb(task)).write()
        this.setDbLastModified()
        return this.getTaskById(task.id)
      }catch(e){
        throw e
      }
    }
    deleteTask(taskid: string): boolean{
        try{
            const task = db.get('tasks').find({id: taskid}).value()
            if(task){
                db.get('tasks').remove({id: taskid}).write()
                this.setDbLastModified()
            }else{
                return false
            }
            return true
        }catch(e){
            throw e
        }
    }

    getOrderByItems = (order: OrderObject) => {
        let orderFields = []
        let orderDirections = []
        if(order.orderByFields){
            orderFields = order.orderByFields
            if(order.orderDirections){
                orderDirections = order.orderDirections
            }else{
                for(let i=0; i<orderFields.length; i++){
                    orderDirections.push('asc')
                }
            }
        }

        let result = {
            orderFields: orderFields,
            orderDirections: orderDirections
        }
        return result
    }
    getWorklogs(filter: WorklogsFilter): Array<Worklog>  {
        const search = JSON.parse(filter as string) as WorklogsFilter
        const where: Partial<Worklog> = search.where ? search.where : {}
        const order: OrderObject = search.order ? search.order : {}

        const {orderFields, orderDirections} = this.getOrderByItems(order)


        const worklogs = db.get('worklogs').filter(wl =>
            (!where.title || wl.title.toLowerCase().includes(where.title.toLowerCase())) &&
            ((!where.endDatetime && !(typeof(where.endDatetime)==='string')) || wl.endDatetime === where.endDatetime)
            //(!search.endDatetime && isEmpty(search.endDatetime) && wl.endDatetime === search.endDatetime)
        )
        .orderBy(orderFields,orderDirections)
        .value()
        const result : Array<Worklog>= []
        worklogs.forEach((worklog: Worklog) => {
            result.push({
                id: worklog.id || '',
                title: worklog.title || '',
                createdDate: worklog.createdDate || '',
                startDatetime: worklog.startDatetime || '',
                endDatetime: worklog.endDatetime || '',
                tags: worklog.tags || []
            })
        })
        return result
    }

    getWorklogById(id: string): WorklogObject {
        try{
            let worklog : Worklog = mapWorklogToApiWorklog(db.get('worklogs').find({id: id}).value()) || null
            let childJobs = []
            childJobs = this.getJobs({worklog: id})
            const calendars = []

            const uniqueCalendars = new Set<string>()
            childJobs.forEach((job) => {
                job.task.calendars.forEach((calendar) => {
                    uniqueCalendars.add(calendar.id)
                })
            })
            uniqueCalendars.forEach((calendarid) => {
                calendars.push(this.getCalendarById(calendarid))
            })


            const worklogObject : WorklogObject= {
                worklog: worklog,
                childJobs: childJobs,
                calendars,
            }
            return worklogObject
        }catch (e){
            throw e
        }
    }
    addWorklog (worklog: Worklog): WorklogObject{
        try{
             let wl: WorklogDB = mapApiWorklogToWorklogDb(worklog)
             db.get('worklogs').push(wl).write()
             this.setDbLastModified()
             return this.getWorklogById(wl.id)
        }catch(e){
            throw e
        }
    }

    updateWorklog(worklog: Worklog): WorklogObject{
        try{
            db.get('worklogs').find({id: worklog.id}).assign(mapApiWorklogToWorklogDb(worklog)).write()
            this.setDbLastModified()
            return this.getWorklogById(worklog.id)
        }catch(e){
            throw e
        }
    }
    deleteWorklog(worklogid: string): boolean{
        try{
            const worklog = db.get('worklogs').find({id: worklogid}).value()
            if(worklog){
                db.get('worklogs').remove({id: worklogid}).write()
                db.get('jobs').remove({worklog: worklogid}).write()
                this.setDbLastModified()
            }else{
                return false
            }
            return true
        }catch(e){
            throw e
        }
    }

    closeWorklog(worklog: Worklog): WorklogObject {
        try{
            worklog = mapApiWorklogToWorklogDb(worklog)
            let runningJob = db.get('jobs').find({worklog: worklog.id, endDatetime: ''}).value()
            if(runningJob){
                runningJob.endDatetime = worklog.endDatetime
                db.get('jobs').find({id: runningJob.id}).assign(runningJob).write()
            }

            db.get('worklogs').find({id: worklog.id}).assign(worklog).write()

            return this.getWorklogById(worklog.id)
        }catch(e){
            throw e
        }
    }

    reopenWorklog(worklog: Worklog): WorklogObject {
        try{
            db.get('worklogs').find({id: worklog.id}).assign(mapApiWorklogToWorklogDb(worklog)).write()

            return this.getWorklogById(worklog.id)
        }catch(e){
            throw e
        }
    }

    getWorklogGroupedData(worklogid: string): any {
        try{
            let result : TaskTreeItem = emptyTaskTree()
            let jobs = db.get('jobs').filter({worklog: worklogid}).value()
            jobs.forEach((job: Job) => {
                let timeInSeconds = job.endDatetime ?
                    elapsedTime(
                        ISOStringToFormatedDate(job.startDatetime),
                        ISOStringToFormatedDate(job.endDatetime)
                    )/1000
                : 0

                if(job.task){
                    result = mergeTaskTrees(getTaskTree(job.task,timeInSeconds,job),result)
                }else{
                    result.jobs.push(job)
                    if(job.endDatetime === ''){
                        result.hasRunningJob = true
                    }
                }
                result.timeInSeconds += timeInSeconds
            })
            return result
        }catch(e){
            throw e
        }
    }

    getTaskGroupedData(id: string): any {
      try{
        return getChildTasksTree(id)
      }catch(e){
          throw e
      }
    }

    getTaskGroupedDataByDate(data: TaskTreeItem): any {

    }

    getJobs(filter: Partial<Job> = {}): Array<JobObject>  {
        let search = {}
        if(typeof filter === 'string'){
            search = JSON.parse(filter as string)
        }else{
            search = filter
        }
        const jobs = db.get('jobs').filter(search).value()
        const result : Array<JobObject>= []
        jobs.forEach((job: Job) => {
            let jobobject: JobObject = {
                job: job,
                task: null,
                worklog: null
            }
            if(!isEmpty(job.task)){
                jobobject.task = mapTaskDbToApiTask(db.get('tasks').find({id: job.task}).value()) || null
            }

            if(!isEmpty(job.worklog)){
                jobobject.worklog = db.get('worklogs').find({id: job.worklog}).value() || null
            }
            result.push(jobobject)
            // result.push({
            //     id: job.id || '',
            //     task: job.task || '',
            //     worklog: job.worklog || '',
            //     title: job.title || '',
            //     description: job.description || '',
            //     startDatetime: job.startDatetime || '',
            //     endDatetime: job.endDatetime || '',
            //     type: job.type || '',
            //     tags: job.tags || []
            // })
        })
        return result
    }
    getJobById(id: string): JobObject {
        try{
            let job = db.get('jobs').find({id: id}).value() || null
            let task = null
            let worklog = null

            if(job && job.task !== ''){
                task = db.get('tasks').find({id: job.task}).value()
            }

            if(job && job.worklog !== ''){
                worklog = db.get('worklogs').find({id: job.worklog}).value()
            }

            const JobObject : JobObject= {
                job: job,
                worklog: worklog,
                task: task
            }
            return JobObject
        }catch (e){
            throw e
        }
    }
    addJob (job: Job): JobObject{
        try{
            let jobs: Array<JobObject> = this.getJobs({worklog: job.worklog})
            checkOverlappingJobs(job,jobs)

            let runningJobs = db.get('jobs').filter({worklog: job.worklog, endDatetime: ''}).value()
            runningJobs.forEach((item) => {
                item.endDatetime = job.startDatetime
                db.get('jobs').find({id: item.id}).assign(item).write()
            })
            db.get('jobs').push(job).write()

            this.setDbLastModified()
            return this.getJobById(job.id)
        }catch(e){
            throw e
        }
    }

    updateJob(job: Job): JobObject{
        try{
            let jobs: Array<JobObject> = this.getJobs({worklog: job.worklog})
            checkOverlappingJobs(job,jobs)
            db.get('jobs').find({id: job.id}).assign(job).write()
            this.setDbLastModified()
            return this.getJobById(job.id)
        }catch(e){
            throw e
        }
    }
    deleteJob(jobid: string): boolean{
        try{
            const job = db.get('jobs').find({id: jobid}).value()
            if(job){
                db.get('jobs').remove({id: jobid}).write()
                this.setDbLastModified()
            }else{
                return false
            }
            return true
        }catch(e){
            throw e
        }
    }
    getCalendars(filter: Partial<CalendarsFilter> = {}): Array<Calendar>  {
      const search = JSON.parse(filter as string)
      const calendars = db.get('calendars').filter(search.where)
        //.orderBy(order,orderDirection)
        .value()
      return calendars;
    }
    getCalendarStatus(calendarid: string): CalendarTime {
      let workedTime = 0
      let currentWeekWorkTime = 0
      let currentMonthWorkTime = 0

      const calendar = db.get('calendars').find({id: calendarid}).value()
      const rootTasksWithCalendar = db.get('tasks').filter((task) => {
        return Array.isArray(task.calendars) && task.calendars.includes(calendarid)
      }).value()

      const tasksTrees = rootTasksWithCalendar.map((task) => getChildTasksTree(task.id))
      const { weekStart, weekEnd } = getCurrentWeekRange()
      const weekStartIso = weekStart.toISOString()
      const weekEndIso = weekEnd.toISOString()
      const { monthStart, monthEnd } = getCurrentMonthRange()
      const monthStartIso = monthStart.toISOString()
      const monthEndIso = monthEnd.toISOString()

      const getWorkedTime = (taskTree) => {
        let worktime = 0
        let weekWorkTime = 0
        let monthWorkTime = 0
        taskTree.jobs.forEach((job) => {
          if (job.startDatetime > calendar.startDate && job.startDatetime < calendar.endDate) {
            const jobtime = job.endDatetime ? elapsedTime(
              ISOStringToFormatedDate(job.startDatetime),
              ISOStringToFormatedDate(job.endDatetime)
            ) : 0
            worktime += jobtime
            if (job.startDatetime >= weekStartIso && job.startDatetime <= weekEndIso) {
              weekWorkTime += jobtime
            }
            if (job.startDatetime >= monthStartIso && job.startDatetime <= monthEndIso) {
              monthWorkTime += jobtime
            }
          }
        })
        taskTree.childTasks.forEach((child) => {
          const { worktime: childWorkTime, weekWorkTime: childWeekWorkTime, monthWorkTime: childMonthWorkTime} = getWorkedTime(child)
          worktime += childWorkTime
          weekWorkTime += childWeekWorkTime
          monthWorkTime += childMonthWorkTime
        })

        return { worktime, weekWorkTime, monthWorkTime }
      }
      tasksTrees.forEach((task) => {
        const { worktime, weekWorkTime, monthWorkTime} = getWorkedTime(task)
        workedTime += worktime
        currentWeekWorkTime += weekWorkTime
        currentMonthWorkTime += monthWorkTime
      })

      const {
        expectedTotalTime,
        currentExpectedTime,
        expectedWeekTime,
        currentWeekExpectedTime,
        expectedMonthTime,
        currentMonthExpectedTime,
      } = this.getCalendarExpectedTime(calendar)

      return {
        expectedTotalTime,
        currentExpectedTime,
        workedTime,
        expectedWeekTime,
        currentWeekExpectedTime,
        currentWeekWorkTime,
        expectedMonthTime,
        currentMonthExpectedTime,
        currentMonthWorkTime,
      }
    }
    getCalendarById(id: string): Calendar {
        try{
            const calendar: CalendarDB = db.get('calendars').find({id: id}).value() || null
            const status = this.getCalendarStatus(id)
            return {
                ...calendar,
                status,
            }
        }catch (e){
            throw e
        }
    }
    getTaskParentChain(taskid: string) {
        const chain = []
        const task = db.get('tasks').find({id: taskid}).value()
        if (task) chain.push(taskid)
        return task?.parent ? chain.concat(this.getTaskParentChain(task.parent)) : chain
    }
    getCalendarDayWorkhours(calendarid: string, date: string) {
        const calendar = db.get('calendars').find({id: calendarid}).value()
        const time = new Date(date)
        const workhours = calendar.workHours.reduce((schedule, current) => {
            const isTimeInRange = time >= new Date(current.startDate) && time <= new Date(current.endDate)
            if (!isTimeInRange) return schedule;
            if (current.nonWorking === CalendarNonWorkingTypes.SICK_DAY) return current;
            if (current.nonWorking === CalendarNonWorkingTypes.ELIGIBLE_HOLIDAY) return current;
            if (current.nonWorking === CalendarNonWorkingTypes.HOLIDAY) return current;
            if (!schedule) return current;
            if (!schedule.nonWorking && current.priority > schedule.priority) return current;
            return schedule;
        }, null)
        return workhours
    }
    getCalendarJobsByDay(calendarid: string): Array<CalendarDayJobs> {
        const calendar = db.get('calendars').find({id: calendarid}).value()
        const tasks = db.get('tasks').filter((task) => task.calendars?.includes(calendar.id)).value()
        const jobs = db.get('jobs').filter((job) => {
            const chain = this.getTaskParentChain(job.task)
            const belongsToCalendarTask = Boolean(tasks.find((task) => chain.includes(task.id)))
            const isInCalendarRange = job.startDatetime > calendar.startDate && job.startDatetime < calendar.endDate
            return belongsToCalendarTask && isInCalendarRange
        }).value()

        const startDate = new Date(calendar.startDate)
        const endDate = new Date(calendar.endDate)
        const days = []


        while(startDate < endDate) {
            const nextDay = new Date(startDate.getTime() + 24*60*60*1000).toISOString()
            const currentDay = startDate.toISOString()
            const currentDayWorkhours = this.getCalendarDayWorkhours(calendarid, currentDay)
            days.push({
                date: currentDay,
                schedule: currentDayWorkhours,
                jobs: jobs.filter((job) => job.startDatetime >= currentDay && job.endDatetime < nextDay)
            })
            startDate.setDate(startDate.getDate() + 1)
        }
        return days
    }
    getCalendarExpectedTime = (values: Calendar): Partial<CalendarTime> => {
        const times = {
            expectedTotalTime: 0,
            currentExpectedTime: 0,
            expectedWeekTime: 0,
            currentWeekExpectedTime: 0,
            expectedMonthTime: 0,
            currentMonthExpectedTime: 0,
        }
        if (!values) return times;

        const today = new Date()
        const { weekStart, weekEnd } = getCurrentWeekRange()
        const { monthStart, monthEnd } = getCurrentMonthRange()
        const initialTime = new Date(values.workHours[0].startDate)
        const endTime = new Date(values.workHours[0].endDate)
        if (!(initialTime && endTime)) return times;
        while(initialTime <= endTime) {
            const workhours = values.workHours.filter((range) => {
            return initialTime >= new Date(range.startDate) &&
                initialTime <= new Date(range.endDate)
            })
            if (workhours.length) {
            //const item = workhours[workhours.length - 1];
            const item = this.getCalendarDayWorkhours(values.id, initialTime.toISOString())
            if (item && !Object.values(CalendarNonWorkingTypes).includes(item.nonWorking)) {
                const dayTime = getDayTime(initialTime, item)
                times.expectedTotalTime += dayTime
                if (initialTime >= weekStart && initialTime <= weekEnd) {
                times.expectedWeekTime += dayTime
                }
                if (initialTime >= monthStart && initialTime <= monthEnd) {
                times.expectedMonthTime += dayTime
                }
            }
            }
            initialTime.setDate(initialTime.getDate() + 1)
            if (initialTime > today && times.currentExpectedTime === 0) {
                times.currentExpectedTime = times.expectedTotalTime
            }
            if (initialTime > today && times.currentWeekExpectedTime === 0) {
                times.currentWeekExpectedTime = times.expectedWeekTime
            }
            if (initialTime > today && times.currentMonthExpectedTime === 0) {
                times.currentMonthExpectedTime = times.expectedMonthTime
            }
        }
        times.currentExpectedTime *= 3600000
        times.expectedTotalTime *= 3600000
        times.expectedWeekTime *= 3600000
        times.currentWeekExpectedTime *= 3600000
        times.expectedMonthTime *= 3600000
        times.currentMonthExpectedTime *= 3600000
        return times
        }
    addCalendar(calendar: Calendar): Calendar {
        try{
            const calendarsTable = db.get('calendars').value()
            if (!calendarsTable) {
                db.set('calendars', []).write()
            }
            delete calendar.status
            db.get('calendars').push(calendar).write()
            this.setDbLastModified()
            return this.getCalendarById(calendar.id)
        }catch(e){
            throw e
        }
    }
    updateCalendar(calendar: Calendar): Calendar {
        try{
            db.get('calendars').find({id: calendar.id}).assign(calendar).unset('status').write()
            this.setDbLastModified()
            return this.getCalendarById(calendar.id)
        }catch(e){
            throw e
        }
    }
    deleteCalendar(id: string): boolean {
      try{
        const calendar: Calendar = db.get('calendars').find({id: id}).value()
        if(calendar){
          db.get('calendars').remove({id: id}).write()
          this.setDbLastModified()
        }else{
          return false
        }
        return true
      }catch(e){
        throw e
      }
    }

    hasDB = (): boolean => {
        if(localStorage.getItem('db') && db.get('metadata').value() && db.get('metadata').value().length ){
            return true
        }
        return false
    }

    initDB = (type: string = 'default', dbfile?: Schema) => {
        if(!this.hasDB()){
            console.info("DB vacía")

            db.defaults({ tasks: [], worklogs: [], jobs: [], metadata: [], calendars: [] }).write()

            if(type === 'example'){
                this.loadDataToDB(exampleData)
            }else if(type === 'import'){
                this.loadDataToDB(dbfile)
            }else if(type === 'empty'){
                this.loadDataToDB(this.emptyDbObject())
            }else{
                // Nothing to do here
            }
        }else{
            console.log("DB con registros")
        }
    }

    emptyDbObject = () : Schema => {
        let now = new Date().toISOString()
        let metadata : metadataDB = {created: now, lastModified: '', lastExported: ''}

        return {
            tasks: [],
            worklogs: [],
            jobs: [],
            metadata: [metadata],
            calendars: [],
        }
    }

    setDbLastModified = (date: string = ''): boolean => {
        try{
            if(date === ''){
                date = new Date().toISOString()
            }
            const metadata = db.get('metadata').value()
            if(metadata.length){
                let md = metadata[0]
                md.lastModified = date;
                db.get('metadata').find().assign(md).write()
                //metadata[0].assign(md).write()
                return true
            }
            return false
        }catch(e){
            throw e
        }
    }

    setDbLastExported = (date: string = ''): boolean => {
        try{
            if(date === ''){
                date = new Date().toISOString()
            }
            const metadata = db.get('metadata').value()
            if(metadata.length){
                let md = metadata[0]
                md.lastExported = date;
                db.get('metadata').find().assign(md).write()
                return true
            }
            return false
        }catch(e){
            throw e
        }
    }

    isDbSynced = () : boolean => {
        try{
            let metadata = db.get('metadata').value()
            let lastModified = metadata[0]?.lastModified ?? ''
            let lastExported = metadata[0]?.lastExported ?? ''

            if(isEmpty(lastModified)){
                return true
            }else if(isEmpty(lastExported)){
                return false
            }else {
                if(new Date(Date.parse(lastModified)) > new Date(Date.parse(lastExported))){
                    return false
                }else{
                    return true
                }
            }
        }catch(e){
            throw e
        }
    }

    // Es necesario borrar todos los items del objeto lowdb ya que guarda los registros en memoria, por lo que aunque borremos el localstorage
    // los volverá a cargar
    clearDB = () => {
        db.get('tasks').remove().write()
        db.get('worklogs').remove().write()
        db.get('jobs').remove().write()
        db.get('metadata').remove().write()
        db.get('calendars').remove().write()
    }

    loadDataToDB = (data: Schema) => {
        this.clearDB()
        const metadata : Array<metadataDB> = data.metadata
        db.set('metadata', metadata).write()

        const tasks : Array<TaskDB> = data.tasks
        db.set('tasks', tasks).write()

        const worklogs: Array<Worklog> = data.worklogs
        db.set('worklogs', worklogs).write()

        const jobs: Array<Job> = data.jobs
        db.set('jobs', jobs).write()

        const calendars: Array<Calendar> = data.calendars
        db.set('calendars', calendars).write()
    }
}

export const startDb = () => {
    setTaskerRepository(new LowdbLocalstorageRepository())
}

interface TaskTreeItem {
    id: string,
    title: string,
    timeInSeconds: number,
    hasRunningJob: boolean,
    jobs: Array<Job>,
    childTasks: Array<TaskTreeItem>
}
const getTaskTree = (taskid: string, time: number, job: Job = null, childTask: TaskTreeItem = null): TaskTreeItem => {
  try{
    let result : TaskTreeItem
    let root : TaskTreeItem = emptyTaskTree()
    let task: TaskDetail = mapTaskDbToApiTask(db.get('tasks').find({id: taskid}).value())
    let hasRunningJob = false
    if(job){
      if(job.endDatetime === ''){
          hasRunningJob = true
      }
    }else{
      if(childTask &&   childTask.hasRunningJob === true){
        hasRunningJob = true
      }
    }
    result = {
      id: task.id,
      title: task.title,
      timeInSeconds: time,
      hasRunningJob: hasRunningJob,
      jobs: job ? [job] : [],
      childTasks: childTask ? [childTask] : []
    }
    if(!isEmpty(task.parent)){
      let parent: TaskTreeItem = getTaskTree(task.parent,time,null,result)
      return parent
    }else{
      root.childTasks.push(result)
      root.hasRunningJob = result.hasRunningJob
      return root
    }
  }catch(e){
    throw e
  }
}

const mergeTaskTrees = (source: TaskTreeItem, target: TaskTreeItem): TaskTreeItem =>{
  if(!hasChildTasks(target) && hasChildTasks(source)){
    target.jobs = target.jobs.concat(source.jobs)
    target.hasRunningJob = source.hasRunningJob || target.hasRunningJob
    target.childTasks = source.childTasks
    return target
  }else if( !hasChildTasks(source) ){
    target.jobs = target.jobs.concat(source.jobs)
    target.hasRunningJob = source.hasRunningJob || target.hasRunningJob
    target.timeInSeconds += source.timeInSeconds
    return target
  }else{
    let commonChilds = itemsPresentInBoth(source,target)
    let missingChilds = itemsMissingInTarget(source,target)

    target.childTasks.forEach(targetItem => {
      let inCommon = commonChilds.filter(commonItem => targetItem.id === commonItem[0].id)
      if(inCommon.length === 1){
        targetItem = mergeTaskTrees(inCommon[0][0],inCommon[0][1])
      }else{
        if(inCommon.length > 0){
          console.error("Error: No debería haber más de un item en común", inCommon)
        }
      }
    })

    missingChilds.forEach(item => {
      target.childTasks.push(item)
    })

    target.jobs = target.jobs.concat(source.jobs)
    target.hasRunningJob = source.hasRunningJob || target.hasRunningJob
    target.timeInSeconds += source.timeInSeconds
    return target
  }
}

const hasChildTasks = (item: TaskTreeItem): boolean => {
    if(item.childTasks.length > 0){
        return true
    }
    return false
}

const emptyTaskTree = () : TaskTreeItem => {
    return {id: '0', title: 'root', timeInSeconds: 0, hasRunningJob: false, jobs: [], childTasks: []}
}

const itemsPresentInBoth = (source: TaskTreeItem, target: TaskTreeItem) : Array<Array<TaskTreeItem>> => {
    let result: Array<Array<TaskTreeItem>> = []
    let mergedIds: Array<string> = []
    let merge = source.childTasks.concat(target.childTasks)

    merge.forEach(item => {
        let commonItems = merge.filter(mergeItem => mergeItem.id === item.id)
        if(commonItems.length === 2){
            if(!mergedIds.includes(item.id)){
                mergedIds.push(item.id)
                result.push(commonItems)
            }
        }else{
            if(commonItems.length !== 1){
                console.error("Error: no debería haber más de un item con el mismo id en un nodo", commonItems)
            }
        }
    })

    return result
}

const itemsMissingInTarget = (source: TaskTreeItem, target: TaskTreeItem): Array<TaskTreeItem> => {
    let result: Array<TaskTreeItem> = []
    source.childTasks.forEach(sourceItem => {
        if(target.childTasks.filter(targetItem => sourceItem.id === targetItem.id).length === 0){
            result.push(sourceItem)
        }
    })

    return result
}

const checkOverlappingJobs = (job: Job, jobs: Array<JobObject>): boolean => {
    let overlappingJobs = jobs.filter(jobItem => {
        if(jobItem.job.id === job.id){
            return false
        }
        if(job.endDatetime !== ''){
            if( job.startDatetime < jobItem.job.endDatetime &&
                job.endDatetime > jobItem.job.startDatetime
            ){
                return true
            }
        }else{
            if(job.startDatetime < jobItem.job.endDatetime){
                return true
            }
        }
        return false
    })

    if(overlappingJobs.length > 0){
        throw new Error(`El intervalo de tiempo de este trabajo se solapa con uno ya existente:
            ${overlappingJobs[0].job.title || 'Sin título'},
            ${overlappingJobs[0].task ? overlappingJobs[0].task.title : 'Sin tarea'},
            ${ISOStringToFormatedDate(overlappingJobs[0].job.startDatetime)},
            ${ISOStringToFormatedDate(overlappingJobs[0].job.endDatetime)}`)
    }

    return false
}

const getChildTasksTree = (taskid: string): TaskTreeItem => {
    const childs = db.get('tasks').filter({parent: taskid}).value()
    const jobs = db.get('jobs').filter({task: taskid}).value()
    const task = db.get('tasks').find({id: taskid}).value()

    let result = emptyTaskTree()
    result.id = taskid
    result.title = task.title
    result.jobs = jobs

    jobs.forEach(job => {
        if(!job.endDatetime){
            result.hasRunningJob = true
        }
        result.timeInSeconds += job.endDatetime ?
            elapsedTime(
                ISOStringToFormatedDate(job.startDatetime),
                ISOStringToFormatedDate(job.endDatetime)
            )/1000
        : 0
    })

    childs.forEach(child => {
        let childTask = getChildTasksTree(child.id)
        if(childTask.hasRunningJob){
            result.hasRunningJob = true
        }
        result.childTasks.push(childTask)
        result.timeInSeconds += childTask.timeInSeconds
    })
    return result
}

const getDayTime = (date, workhours) => {
    const day = date.getDay()
    if (day === 0) return workhours.sunday
    if (day === 1) return workhours.monday
    if (day === 2) return workhours.tuesday
    if (day === 3) return workhours.wednesday
    if (day === 4) return workhours.thursday
    if (day === 5) return workhours.friday
    if (day === 6) return workhours.saturday
}

const getCurrentWeekRange = () => {
    const today = new Date()
    const weekStart = new Date()
    const weekEnd = new Date()
    const weekStartDiff = today.getDay() === 0 ? 7 : today.getDay() - 1
    weekStart.setDate(weekStart.getDate() - weekStartDiff)
    weekStart.setHours(0,0,0,0)
    weekEnd.setDate(weekStart.getDate() + 7)
    weekEnd.setHours(0,0,0,0)

    return { weekStart, weekEnd }
}

const getCurrentMonthRange = () => {
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0)
    const monthEnd = new Date(today.getFullYear(), today.getMonth()+1, 0, 0, 0, 0, 0);

    return { monthStart, monthEnd }
}

/*
const getDirectChildTasksTree = (taskid: string): TaskTreeItem => {
    let childs = db.get('tasks').filter({parent: taskid}).value()
    let jobs = db.get('jobs').filter({task: taskid}).value()
    let task = db.get('tasks').find({id: taskid}).value()

    let result = emptyTaskTree()
    result.id = taskid
    result.title = task.title
    result.jobs = jobs

    jobs.forEach(job => {
        if(!job.endDatetime){
            result.hasRunningJob = true
        }
        result.timeInSeconds += job.endDatetime ?
            elapsedTime(
                ISOStringToFormatedDate(job.startDatetime),
                ISOStringToFormatedDate(job.endDatetime)
            )/1000
        : 0
    })

    childs.forEach(child => {
        let childIds = getAllChildTasksIds(child.id)
        let childJobs = db.get('jobs').filter((v) => childIds.includes(v.task)).value()
        let childObject = emptyTaskTree()
        childObject.id = child.id
        childObject.title = child.title

        childJobs.forEach(job => {
            if(!job.endDatetime){
                childObject.hasRunningJob = true
                result.hasRunningJob = true
            }
            childObject.timeInSeconds += job.endDatetime ?
                elapsedTime(
                    ISOStringToFormatedDate(job.startDatetime),
                    ISOStringToFormatedDate(job.endDatetime)
                )/1000
            : 0
        })
        result.timeInSeconds += childObject.timeInSeconds
        result.childTasks.push(childObject)
    })
    return result
}

const getAllChildTasksIds = (taskid: string): Array<string> => {
    let childs = db.get('tasks').filter({parent: taskid}).value()
    let result = []

    childs.forEach(child => {
        result.push(child.id)
        result.concat(getAllChildTasksIds(child.id))
    })

    return result
}
*/