import React from 'react'
import { Worklog, WorklogObject } from 'src/front/domain/worklog'
import styled from 'styled-components'
import {color, common} from '../../../styles/theme'
import { RunningWorklogsStateContext } from '../../../application/contexts/runningWorklogsContext'
import { getWorklogList } from '../../../application/getWorklogList'
import { formatElapsedTime, elapsedTime, ISOStringToFormatedDate, dateToFormattedDate } from '../../../../lib/date.utils'
import { RunningElapsedTime } from './worklog-sequence.component'
import { Link } from 'react-router-dom'

const RunningWorklogsContainer = styled.div`
    display: flex;
    flex-direction: column;
    ${common.roundedCorners()};
    border-style: solid;
    border-width: 2px;
    border-color: green;
    background-color: ${color.lightGreen};
    padding: 1rem;
`

const RunningWorklogsItem = styled.div`

`

const RowLink = styled(Link)`
    display: inline-block;
    width: 100%;
`
export const RunningWorklogsWidget = () => {
    const runningWorklogsCtx = React.useContext(RunningWorklogsStateContext)
    const {state, setState} = runningWorklogsCtx
    const [worklogs, setWorklogs] = React.useState<Array<Worklog>>([])

    React.useEffect(()=> {
        getWorklogList({endDatetime: ''}).then(
            result => {                
                if(!result.hasError){
                    setWorklogs(result.data)
                }else{
                    console.log(result.error)
                }
            },
            error => {
                console.log(error)
            }
        )
    },[])

    return (
        <RunningWorklogsContainer>        
        {worklogs.length > 0 ?
            worklogs.map((worklog) => {
                return(
                    <RunningWorklogsItem>{worklog.title}</RunningWorklogsItem>
                )
            })
            :
            <div>No hay partes activos</div>
        }
        </RunningWorklogsContainer>
    )
}

const RunningWorklogTable = styled.table`
    width: 100%;

    & th {
        font-weight: bold;
        border-style:solid;
        border-width: 0 0 1px 0;
        border-color: ${color.darkGrey};
    }

    & td {
        padding: 0.5rem 0;
    }
`

export const RunningWorklogsTable = () => {
    
    const [worklogs, setWorklogs] = React.useState<Array<Worklog>>([])

    React.useEffect(()=> {
        getWorklogList({endDatetime: ''}).then(
            result => {                
                if(!result.hasError){
                    console.log(result.data)
                    setWorklogs(result.data)
                }else{
                    console.log(result.error)
                }
            },
            error => {
                console.log(error)
            }
        )
    },[])

    return (    
        <>   
        {worklogs.length > 0 ? 
            <RunningWorklogTable>
                <thead>
                    <tr>
                        <th>Título</th>
                        <th>Tiempo</th>
                    </tr>
                </thead>
                <tbody>
                {
                    worklogs.map((worklog) => {
                        return(
                            <tr key={`worklogs_activos_${worklog.id}`}>
                                <td><RowLink to={`worklogs/${worklog.id}`}>{worklog.title}</RowLink></td>
                                <td><RunningElapsedTime start={worklog.startDatetime}/></td>
                            </tr>
                        )
                    })    
                }
                </tbody>
            </RunningWorklogTable>   
            :
            <div>No hay partes activos</div>
        }
        </>    
    )
}