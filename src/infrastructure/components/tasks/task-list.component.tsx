import React from 'react'
import { TaskItem } from '../../../domain/task-list'
import styled from 'styled-components'
import { color, common } from '../../../styles/theme';
import {     
    Link,
  } from "react-router-dom";

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

    React.useEffect(() => {
        fetch('http://localhost:3000/api/tasks')
            .then(res => res.json())
            .then(
                (result) => {setTasks(result); setError(null)},
                (error) => setError(error)
            )
    },[])    
    
     return (
        <div className="block">
            <h3 className="section-title">Tareas</h3>            
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