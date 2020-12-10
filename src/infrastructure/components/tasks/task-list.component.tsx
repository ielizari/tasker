import React from 'react'
import { ApiResponse } from '../../../api/domain/api-response'
import { TaskItem } from '../../../domain/task-list'
import { getTaskList } from '../../../application/getTaskList'
import styled from 'styled-components'
import { color, common } from '../../../styles/theme';
import { Link } from "react-router-dom";

import { Spinner } from '../common/spinner'

import { BlockActions } from '../common/block-actions'
import { FaPlus } from 'react-icons/fa'

const ListItem = styled.li`
    list-style: none;
    padding: 1rem;
    margin: 1rem;
    border-style: solid;
    border-width: 1px;
    border-color: ${color.orange};
    background-color: ${color.orange};
    color: ${color.white};
    ${common.roundedCorners()};
`

const TaskListItem = (props: {task: TaskItem } ) => {    
    
    return(
        <ul>
            <Link to={`/tasks/${props.task.id}`}>
                <ListItem>{props.task.title}</ListItem>
            </Link>
        </ul>
    )
}
export const TaskListComponent = () => {
    const [tasks, setTasks] = React.useState<Array<TaskItem>>([])
    const [error, setError] = React.useState<Error | null>(null)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [actions, setActions] = React.useState<Array<any>>([])

    let actionItems = [
        {
            icon: FaPlus,
            text: 'Nueva tarea',
            route: `/tasks/new`,
            type: 'link'
        }
    ]

    React.useEffect(() => {        
        setLoading(true)
        setActions(actionItems)
        getTaskList()
            .then(
                (result) => {
                    if(result.hasError){
                        setError(new Error(result.error));
                        setTasks([])
                    }else{
                        setTasks(result.data); 
                        setError(null);
                    }
                    
                    setLoading(false)    
                },
                (error) => {
                    setError(error)
                    setLoading(false)    
                }
            )
    },[])    
    
     return (
        <div className="block">
             {loading ? <Spinner /> : ''}
            <h3 className="section-title">Tareas</h3>     
            <BlockActions 
                actions={actions}
            />
            {error!==null ? 
                <div>Error: {error.message?error.message:'unknown error'}</div> 
                :
                tasks.map((item: TaskItem) => (
                    <TaskListItem key={item.id} task={item} />
                ))
            }
        </div>
        )
    
}