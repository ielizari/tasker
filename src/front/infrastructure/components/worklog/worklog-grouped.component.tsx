import React from 'react'
import styled from 'styled-components'
import { color } from '../../../styles/theme'
import { Job} from 'src/front/domain/job'
import { WorklogObject } from 'src/front/domain/worklog'
import { getWorklogGrouped } from 'src/front/application/getWorklogGroupedData'
import { elapsedTime, formatElapsedTime, formatElapsedTimeFromSeconds, ISOStringToFormatedDate } from '../../../../lib/date.utils'
import { RunningElapsedTime } from './worklog-sequence.component'

interface TaskTreeItem {
    id: string,
    title: string,
    timeInSeconds: number,
    hasRunningJob: boolean,
    jobs: Array<Job>,
    childTasks: Array<TaskTreeItem>
}

const Container = styled.div`
    color: #000;
`
const NodeInfo = styled.div`
    display: flex;
    flex-direction: row;
    justifiy-content: space-evenly;
    gap: 0.3rem;
    align-items: center;

    :hover {
        background-color: ${color.lightGrey};
    }
`

const NodeInfoTitle = styled.div`
    flex-grow: 1;
`

const ChildTasks = styled.div`
    padding-left: 1rem;
`

const Expand = styled.div`
    boder-style: solid;
    border-width: 1px;
    border-color: #000;
    padding: 0.2rem;
    cursor: pointer;
`

const ChildJobs = styled.div`
    padding-left: 2rem;
    color: ${color.blue};
`
const GroupedNode = (props: {node: TaskTreeItem, runningJobHandler?}) => {
    const [node, setNode] = React.useState<TaskTreeItem>(null)
    const [showChildren, setShowChildren] = React.useState<boolean>(true)
    const [nodeElapsedSeconds, setNodeElapsedSeconds] = React.useState<number>(0)
    const [runningJobStart, setRunningJobStart] = React.useState<string>(null)

    const showChildrenItems = () => { setShowChildren(true)}
    const hideChildrenItems = () => { setShowChildren(false)}

    React.useEffect(() => {
        if(node && node.title === 'root'){
            setShowChildren(true)
        }
        if(node){
            setNodeElapsedSeconds(node.timeInSeconds)
            handleRunningJob()
        }
        
    },[node])

    React.useEffect(()=>{
        setNode(props.node)
    },[props.node])

    React.useEffect(()=> {
        if(props.runningJobHandler){
            props.runningJobHandler(runningJobStart)
        }      
    },[runningJobStart])

    const handleRunningJob = () => {
        let start = node.jobs.filter(j => j.endDatetime === '')
        if(start.length > 0){                  
            setRunningJobStart(start[0].startDatetime)            
        }else{
            setRunningJobStart(runningJobStart)
        }
    }   

    const handleChildRunningJob = (start: string) => {
        setRunningJobStart(start)
    }
    return (
        <>
        {node &&
            <>            
            <NodeInfo>                
                {showChildren ?
                    <Expand onClick={hideChildrenItems}>-</Expand>
                    :
                    <Expand onClick={showChildrenItems}>+</Expand>
                }
                <NodeInfoTitle>{node.title !== '' ? node.title : 'Sin título'}</NodeInfoTitle>
                <span>
                {node.hasRunningJob && runningJobStart ?
                    <RunningElapsedTime start={runningJobStart} initialSeconds={nodeElapsedSeconds}/>
                    :
                    formatElapsedTimeFromSeconds(node.timeInSeconds)
                }
                </span>
            </NodeInfo>
            {showChildren && node.jobs.length > 0 &&
                <ChildJobs>
                    {node.jobs.map(item => {
                        return(
                        <NodeInfo key={`grouped_job_${item.id}`}>
                            <NodeInfoTitle>{item.title !== '' ? item.title : 'Sin título'}</NodeInfoTitle>
                            <span>
                                {item.endDatetime !== '' ?
                                    formatElapsedTime(elapsedTime(
                                        ISOStringToFormatedDate(item.startDatetime),
                                        ISOStringToFormatedDate(item.endDatetime)                                    
                                    ))
                                    :
                                    <RunningElapsedTime start={item.startDatetime} />
                                }
                            </span>
                        </NodeInfo>
                        )
                    })}
                </ChildJobs>
            }
            {showChildren && node.childTasks.length > 0 &&                 
                <ChildTasks>
                {node.childTasks.map(item => {
                    return <GroupedNode key={`grouped_${item.id}`} node={item} runningJobHandler={handleChildRunningJob}/>
                })
                }          
                </ChildTasks>
            }            
            </>
        }
        </>
    )
}

export const WorklogGrouped = (props: {className?: string, worklog: WorklogObject}) => {
    const [ groupedData, setGroupedData ] = React.useState(null)
    const [worklog, setWorklog] = React.useState<WorklogObject>(null)

    React.useEffect(()=> {
        setWorklog(props.worklog)
    },[])

    React.useEffect(() => {
        if(worklog){
            getWorklogGrouped(worklog.worklog.id).then(
                result => {
                    if(!result.hasError){
                        setGroupedData(result.data)
                    }else{
                        console.log(result.error)
                    }
                },
                error => {
                    console.log(error)
                }
            )
        }
    }, [worklog, props.worklog])

    return (
        <Container className={props.className ? props.className : ''}>
            {groupedData && 
                <GroupedNode node={groupedData} />
            }
        </Container>
    )
}