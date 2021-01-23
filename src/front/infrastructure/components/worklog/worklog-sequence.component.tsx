import React from 'react'
import styled from 'styled-components'
import { color, font } from '../../../styles/theme'
import { dateToFormattedDate, elapsedTime, formatElapsedTime, formattedDateToDate, formattedDateToISOString, ISOStringToFormatedDate } from '../../../../lib/date.utils'

import { WorklogObject } from '../../../domain/worklog'
import { Job, JobObject } from '../../../domain/job'
import { IconButton } from '../common/icon-button'
import { FaPlus, FaStop, FaPause, FaPlay, FaRedoAlt } from 'react-icons/fa'
import { JobNewComponent } from '../job/job-new.component'
import { getWorklog } from '../../../application/getWorklog'
import { closeWorklog } from '../../../application/closeWorklog'
import { reopenWorklog } from '../../../application/reopenWorklog'
import { addJob } from '../../../application/addJob'
import { updateJob } from '../../../application/updateJob'
import { SyncStateContext} from '../../../application/contexts/dbSyncContext'
import { mapApiJobToComponent } from 'src/front/application/dtos/jobApiToComponent.dto'

const SequenceContainer = styled.div`
    padding: 1rem;
`

const ButtonSequenceContainer = styled.div`
    display: flex;
    justify-content: center;
    padding: 1rem;
    gap: 1rem;
`

const SequenceTable = styled.table`
    width: 100%;
    color: ${color.veryDarkGrey};
    ${font.base()};
    
    & thead > tr {
        border-style: solid;
        border-width: 1px;
        border-color: ${color.veryDarkGrey};
        background-color: ${color.tableHeaderBackground};
        color: ${color.tableHeaderColor};        
    }
    & tbody > tr {
        border-style: solid;
        border-width: 1px;
        border-color: ${color.veryDarkGrey};
    }

    & tbody > tr:hover{
        background-color: #f3f3f3;
        cursor: pointer;
    }

    & th { font-weight: bold; }
    & th, td {
        padding: 1rem; 
        vertical-align: middle;        
    }  

    & td:nth-child(4n), th:nth-child(4n) {
        width: 25%;
    }
    & td:last-child, th:last-child {
       width: 100%;
    }
`

const EmptySequence = styled.div`
    text-align: center;
    font-style: italic;
`

const PauseRow = styled.tr`
    background-color: ${color.grey};
`

const DayRow = styled.tr`
    background-color: ${color.lightGreen};
    text-align: center;
`
const RunningTimer = styled.div`
    font-weight: bold;
`
interface Pause {
    startDatetime: string
    endDatetime: string
}

interface Day {
    date: string
}

export const RunningElapsedTime = (props: {start, initialSeconds?}) => {
    const [start,setStart] = React.useState(props.start)
    const [initialSeconds, setInitialSeconds] = React.useState<number>(0)
    const [diff, setDiff] = React.useState(null) 

    React.useEffect(() => {
        setStart(props.start)
    },[props.start])

    React.useEffect(() => {        
        if(props.initialSeconds){
            setInitialSeconds(props.initialSeconds*1000)
        }else{
            setInitialSeconds(0)
        }
    },[props.initialSeconds])

    React.useEffect(() => {
        const interval = setInterval(() => {   
            setDiff(formatElapsedTime(
                elapsedTime(
                    ISOStringToFormatedDate(start,'datetime','dmy/','hms'),
                    ISOStringToFormatedDate(new Date().toISOString(),'datetime','dmy/','hms')
                ) + initialSeconds
            ))
        }, 500);
        return () => clearInterval(interval);
      }, [initialSeconds,start]);   
    
    return(
        <RunningTimer>
            {diff}
        </RunningTimer>
    )
}

export const WorklogSequence = (props: {worklog: WorklogObject, worklogChangeHandler?}) => {
    const syncCtx = React.useContext(SyncStateContext)
    const {setSync} = syncCtx
    const [ worklogObj, setWorklogObj ] = React.useState<WorklogObject>(props.worklog)
    const [ jobView, setJobView ] = React.useState<boolean>(false)
    const [ editJob, setEditJob ] = React.useState<Job>(null)
    const [ sequence, setSequence ] = React.useState<Array<JobObject|Pause|Day>>([])
    const [ pausedJob, setPausedJob ] = React.useState<Job>(null)

    React.useEffect(() => {
        if(sequence.length > 1 && isPause(sequence[sequence.length-1])){
            setPausedJob((sequence[sequence.length-2] as JobObject).job)
        }else{
            setPausedJob(null)
        }
    },[sequence])

    React.useEffect(() => {
        setWorklogObj(props.worklog)
    },[props.worklog])

    React.useEffect(() => {
        
        let res : Array<JobObject | Pause | Day> = []
    
        if(worklogObj){
    
            let sortedJobs = worklogObj.childJobs.sort((a,b) => {
                if(a.job.startDatetime > b.job.startDatetime){
                    return 1
                }else if(a.job.startDatetime < b.job.startDatetime){
                    return -1
                }else{
                    return 0
                }
            })
        
            let actualDate: Date
            for (let i=0; i< sortedJobs.length; i++){
                if(res.length === 0){
                    actualDate = formattedDateToDate(ISOStringToFormatedDate(sortedJobs[i].job.startDatetime))
                    let day : Day = {
                        date: actualDate.getDate() + '/' + (actualDate.getMonth()+1) + '/' + actualDate.getFullYear()
                    }
                    res.push(day)
                }else{
                    if(isJob(res[res.length-1])){
                        let lastItem: Job = (res[res.length-1] as JobObject).job
                        let start = formattedDateToDate(ISOStringToFormatedDate(lastItem.startDatetime))
                        let end = lastItem.endDatetime !== '' ? formattedDateToDate(ISOStringToFormatedDate(lastItem.endDatetime)) : new Date()
                        if(start.getDate() !== end.getDate()){
                            let newDay: Day = {
                                date: end.getDate() + '/' + (end.getMonth()+1) + '/' + end.getFullYear()
                            }
                            res.push(newDay)
                        }
                    }else if (isPause(res[res.length-1])){
                        let lastItem = res[res.length-1] as Pause
                        let start = formattedDateToDate(ISOStringToFormatedDate(lastItem.startDatetime))
                        let end = lastItem.endDatetime !== '' ? formattedDateToDate(ISOStringToFormatedDate(lastItem.endDatetime)) : new Date()
                        if(start.getDate() !== end.getDate()){
                            let newDay: Day = {
                                date: end.getDate() + '/' + (end.getMonth()+1) + '/' + end.getFullYear()
                            }
                            res.push(newDay)
                        }
                    }
                        
                }
                res.push(sortedJobs[i])
                if(i+1 < sortedJobs.length  && sortedJobs[i].job.endDatetime < sortedJobs[i+1].job.startDatetime){
                    let pause : Pause = {
                        startDatetime: sortedJobs[i].job.endDatetime,
                        endDatetime: sortedJobs[i+1].job.startDatetime
                    }
                    res.push(pause)
                }else if(i+1 >= sortedJobs.length && sortedJobs[i].job.endDatetime !== '' && (worklogObj.worklog.endDatetime === '' || worklogObj.worklog.endDatetime > sortedJobs[i].job.endDatetime)){                
                    let pause : Pause = {
                        startDatetime: sortedJobs[i].job.endDatetime,
                        endDatetime: formattedDateToISOString(worklogObj.worklog.endDatetime)
                    }                
                    res.push(pause)
                }       
            }
        }
        
        setSequence(res)
    },[worklogObj])

    const addJobHandler = (job: Job = null) => {
        if(job.worklog){
            setEditJob(job)
        }else{
            setEditJob(null)
        }    
        setJobView(true)
    }
    const returnJobHandler = () => {        
        setJobView(false)
    }

    const pauseJobHandler = () => {
        if(!pausedJob && !isPause(sequence[sequence.length-1])){
            let lastJob: Job = Object.assign({},mapApiJobToComponent((sequence[sequence.length-1] as JobObject).job))
            lastJob.endDatetime = dateToFormattedDate(new Date())
            updateJob(lastJob).then(
                result => {
                    if(!result.hasError){
                        submitHandler()
                    }else{
                        console.log(result.error)
                    }
                },
                error => {
                    console.log(error)

                }
            )
        }
    }

    const resumeJobHandler = () => {
        if(pausedJob){
            let tmpjob = Object.assign({},pausedJob)
            tmpjob.endDatetime = ''
            updateJob(mapApiJobToComponent(tmpjob)).then(
                result => {
                    if(!result.hasError){
                        submitHandler()
                    }else{
                        console.log(result.error)
                    }
                },
                error => {
                    console.log(error)

                }
            )
        }
    }

    const repeatJobHandler = () => {
        if(pausedJob){
            let tmpjob = Object.assign({},pausedJob)
            let startEnd = new Date().toISOString()
            updateJob(mapApiJobToComponent(tmpjob)).then(
                result => {
                    if(!result.hasError){
                        let newJob : Job = tmpjob
                        tmpjob.startDatetime = startEnd
                        tmpjob.endDatetime = ''
                        tmpjob.id=''
                        addJob(mapApiJobToComponent(newJob)).then(
                            result => {
                                if(!result.hasError){
                                    submitHandler()
                                }else{
                                    console.log(result.error)
                                }
                            },
                            error => {
                                console.log(error)
            
                            }
                        )
                    }else{
                        console.log(result.error)
                    }
                },
                error => {
                    console.log(error)

                }
            )            
        }
    }

    const finishWorklogHandler = () => {
        worklogObj.worklog.endDatetime = ISOStringToFormatedDate(new Date().toISOString())
        closeWorklog(worklogObj.worklog).then(
            result => {
                if(!result.hasError){
                    setSync({sync: false})
                    if(props.worklogChangeHandler){
                        props.worklogChangeHandler(result.data)
                    }else{
                        setWorklogObj(result.data)
                    }
                }else{
                    console.log(result.error)
                }
            },
            error => {
                console.log(error)
            }
        )
    }

    const reopenWorklogHandler = () => {
        worklogObj.worklog.endDatetime = ''
        reopenWorklog(worklogObj.worklog).then(
            result => {
                if(!result.hasError){
                    setSync({sync: false})
                    if(props.worklogChangeHandler){
                        props.worklogChangeHandler(result.data)
                    }else{
                        setWorklogObj(result.data)
                    }
                }else{
                    console.log(result.error)
                }
            },
            error => {
                console.log(error)
            }
        )
    }

    const submitHandler = () => {
        setJobView(false)
        getWorklog(worklogObj.worklog.id).then(
            result => {
                if(!result.hasError){
                    if(props.worklogChangeHandler){
                        props.worklogChangeHandler(result.data)
                    }else{
                        setWorklogObj(result.data)
                    }
                }else{
                    console.log(result.error)
                    setWorklogObj(null)
                }
            },
            error => {
                throw error
            }
        )
    }

    const isPause = (object: any): object is Pause => {
        return !('job' in object) && ('startDatetime' in object)
    }

    const isDay = (object: any): object is Day => {
        return ('date' in object)
    }

    const isJob = (object: any): object is Job => {
        return ('job' in object)
    }

    return(
        <>
        { jobView ?
            <JobNewComponent
                worklog={worklogObj.worklog}
                job={editJob}
                submit={submitHandler}
                cancel={returnJobHandler}
            />
            :
            <SequenceContainer>            
                <SequenceTable>
                    <thead>
                        <tr>
                            <th>Inicio</th>
                            <th>Fin</th>
                            <th>Tiempo</th>
                            <th>Tarea</th>
                            <th>Trabajo</th>
                        </tr>
                    </thead>
                    <tbody>
                    {worklogObj.childJobs.length > 0 && sequence.length > 0 ?  
                        sequence.map((child: JobObject | Pause | Day) =>{
                            if(isPause(child)){
                                return (
                                    <PauseRow key={child.startDatetime}>
                                        <td>{ISOStringToFormatedDate(child.startDatetime, 'time')}</td>
                                        <td>{ISOStringToFormatedDate(child.endDatetime, 'time')}</td>
                                        <td>
                                            {child.endDatetime ? 
                                            formatElapsedTime(elapsedTime(ISOStringToFormatedDate(child.startDatetime), ISOStringToFormatedDate(child.endDatetime)))
                                            : 
                                            <RunningElapsedTime start={child.startDatetime}/>
                                            }                                        
                                        </td>
                                        <td></td>
                                        <td>Pausa</td>
                                    </PauseRow>
                                )
                            }else if(isDay(child)){       
                                return(                         
                                    <DayRow key={`day_${child.date}`}>
                                        <td colSpan={5}>{child.date}</td>
                                    </DayRow>
                                )
                            }else{
                                return (
                                    <tr key={child.job.id} onClick={() => addJobHandler(child.job)}>
                                        <td>{ISOStringToFormatedDate(child.job.startDatetime, 'time')}</td>
                                        <td>{ISOStringToFormatedDate(child.job.endDatetime, 'time')}</td>
                                        <td>
                                            {child.job.endDatetime ? 
                                            formatElapsedTime(elapsedTime(ISOStringToFormatedDate(child.job.startDatetime), ISOStringToFormatedDate(child.job.endDatetime)))
                                            : 
                                            <RunningElapsedTime start={child.job.startDatetime}/>
                                            }                                        
                                        </td>
                                        <td>{child.task && child.task.title}</td>
                                        <td>{child.job.title}</td>
                                    </tr>
                                )
                            }
                        })
                        :
                        <tr><td colSpan={5}><EmptySequence>No hay trabajos creados</EmptySequence></td></tr>
                    }
                    </tbody>
                </SequenceTable>
                
                <ButtonSequenceContainer>
                    <IconButton
                        onClick={addJobHandler}
                        text="Añadir trabajo"
                        type="button"
                        icon={FaPlus}            
                    /> 
                    
                    {worklogObj.worklog.endDatetime === '' &&           
                        (!pausedJob ?
                            <IconButton
                                onClick={pauseJobHandler}
                                text="Pausar trabajo"
                                type="button"
                                icon={FaPause}            
                            />
                            :
                            <>
                                <IconButton
                                    onClick={repeatJobHandler}
                                    text="Reanudar trabajo"
                                    type="button"
                                    icon={FaRedoAlt}            
                                />
                                <IconButton
                                    onClick={resumeJobHandler}
                                    text="Reanudar trabajo sin pausa"
                                    type="button"
                                    icon={FaPlay}            
                                />
                            </>
                            
                        )
                    }
                    {worklogObj.worklog.endDatetime === '' ?
                        <IconButton
                            onClick={finishWorklogHandler}
                            text="Cerrar parte"
                            type="button"
                            icon={FaStop}            
                        />
                        :
                        <IconButton
                            onClick={reopenWorklogHandler}
                            text="Reabrir parte"
                            type="button"
                            icon={FaPlay}            
                        />
                    }
                </ButtonSequenceContainer>
            </SequenceContainer>
        }
        </>
    )
}