import React from 'react'
import styled from 'styled-components'
import { color, common } from '../../../styles/theme'
import { elapsedTime, formatElapsedTime, ISOStringToFormatedDate } from '../../../../lib/date.utils'

import { WorklogObject, Worklog } from '../../../domain/worklog'
import { Job, JobObject } from '../../../domain/job'
import { IconButton } from '../common/icon-button'
import { FaPlus } from 'react-icons/fa'
import { JobNewComponent } from '../job/job-new.component'
import { chdir } from 'process'
import { reduceRight } from 'lodash'

const SequenceContainer = styled.div`
    padding: 1rem;
`

const ButtonAddJobContainer = styled.div`
    display: flex;
    justify-content: center;
    padding: 1rem;    
`

const SequenceTable = styled.table`
    width: 100%;
    color: ${color.veryDarkGrey};
    
    & thead > tr {
        border-style: solid;
        border-width: 1px;
        border-color: ${color.veryDarkGrey};
        background-color: ${color.lightOrange};
    }
    & tbody > tr {
        border-style: solid;
        border-width: 1px;
        border-color: ${color.veryDarkGrey};
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

export const RunningElapsedTime = (props) => {
    const [start,setStart] = React.useState(props.start)
    const [diff, setDiff] = React.useState(null) 

    const calculateDiff = (): string => {
        return formatElapsedTime(
            elapsedTime(
                ISOStringToFormatedDate(start,null,'hms'),
                ISOStringToFormatedDate(new Date().toISOString(),null,'hms')
            )
        )
    }
    React.useEffect(() => {
        setDiff(calculateDiff())
        const interval = setInterval(() => {   
            setDiff(calculateDiff()) 
        }, 500);
        return () => clearInterval(interval);
      }, []);
    

    
    return(
        <>
            {diff}
        </>
    )
}

export const WorklogSequence = (props) => {
    const [ worklogObj, setWorklogObj ] = React.useState<WorklogObject>(props.worklog)
    const [jobView, setJobView] = React.useState<boolean>(false)

    const addJobHandler = () => {
        setJobView(true)
    }
    const returnJobHandler = () => {
        setJobView(false)
    }
    console.log(worklogObj)
    return(
        <>
        { jobView ?
            <JobNewComponent
                worklog={worklogObj.worklog}
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
                    {worklogObj.childJobs.length &&            
                        worklogObj.childJobs.map((child: JobObject) => {
                            return (
                                <tr>
                                    <td>{ISOStringToFormatedDate(child.job.startDatetime)}</td>
                                    <td>{ISOStringToFormatedDate(child.job.endDatetime)}</td>
                                    <td>
                                        {child.job.endDatetime ? 
                                        formatElapsedTime(elapsedTime(ISOStringToFormatedDate(child.job.startDatetime), ISOStringToFormatedDate(child.job.endDatetime)))
                                        : 
                                        <RunningElapsedTime start={child.job.startDatetime}/>
                                        }                                        
                                    </td>
                                    <td>{child.task.title}</td>
                                    <td>{child.job.title}</td>
                                </tr>
                            )
                        })
                    }
                    </tbody>
                </SequenceTable>
                
                <ButtonAddJobContainer>
                    <IconButton
                        onClick={addJobHandler}
                        text="Añadir trabajo"
                        type="button"
                        icon={FaPlus}            
                    />
                </ButtonAddJobContainer>
            </SequenceContainer>
        }
        </>
    )
}