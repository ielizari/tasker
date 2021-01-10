import React from 'react'
import styled from 'styled-components'
import { color } from '../../../styles/theme'
import { WorklogObject } from 'src/front/domain/worklog'
import { JobObject, Job} from 'src/front/domain/job'
import { getWorklogGrouped } from 'src/front/application/getWorklogGroupedData'
import { elapsedTime, formatElapsedTime, formatElapsedTimeFromSeconds, ISOStringToFormatedDate } from '../../../../lib/date.utils'
import { RunningElapsedTime } from './worklog-sequence.component'

interface TaskTreeItem {
    id: string,
    title: string,
    timeInSeconds: number,
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
const GroupedNode = (props: {node: TaskTreeItem}) => {
    const [node, setNode] = React.useState<TaskTreeItem>(null)
    const [showChildren, setShowChildren] = React.useState<boolean>(false)

    const showChildrenItems = () => { setShowChildren(true)}
    const hideChildrenItems = () => { setShowChildren(false)}

    React.useEffect(() => {
        if(node && node.title === 'root'){
            setShowChildren(true)
        }
    },[node])
    React.useEffect(()=>{
        setNode(props.node)
    },[props.node])

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
                <span>{formatElapsedTimeFromSeconds(node.timeInSeconds)}</span>
            </NodeInfo>
            {showChildren && node.jobs.length > 0 &&
                <ChildJobs>
                    {node.jobs.map(item => {
                        return(
                        <NodeInfo>
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
                    return <GroupedNode node={item} />
                })
                }          
                </ChildTasks>
            }            
            </>
        }
        </>
    )
}

export const WorklogGrouped = (props: {className?: string, worklogid: string}) => {
    const [ groupedData, setGroupedData ] = React.useState(null)

    React.useEffect(() => {
        getWorklogGrouped(props.worklogid).then(
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
    }, [props.worklogid])

    return (
        <Container className={props.className ? props.className : ''}>
            {groupedData && 
                <GroupedNode node={groupedData} />
            }
        </Container>
    )
}