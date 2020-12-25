import React from 'react'
import { TaskItem } from '../../../domain/task-list'
import { getTaskList } from '../../../application/getTaskList'
import styled from 'styled-components'
import { color, common } from '../../../styles/theme';
import { Link } from "react-router-dom";

import { Spinner } from '../common/spinner'

import { BlockHeaderComponent, BlockContainer, BlockEmptyComponent } from '../common/block'
import { FaPlus, FaFilter } from 'react-icons/fa'
import { TaskDetail } from '../../../domain/task-detail'


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
export const TaskListComponent = (props) => {
    const [tasks, setTasks] = React.useState<Array<TaskItem>>([])
    const [error, setError] = React.useState<Error | null>(null)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [actions, setActions] = React.useState<Array<any>>([])
    const [filters, setFilters ] = React.useState<Partial<TaskDetail>>(props.filter ||{parent: ''})

    

    const searchHandler = (values) => {
        const filter: Partial<TaskDetail> = {
            parent: ''
        }
        if(values.actionBarSearch){
            filter.title = values.actionBarSearch
        }
        setFilters(filter)
    }

    const validation = (values) => {
        const errors = []
        return errors
    }

    React.useEffect(() => {  
        let cancelled = false
        setLoading(true)
        setActions(actionItems)
        getTaskList(filters)
            .then(
                (result) => {
                    if(!cancelled){
                        if(result.hasError){
                            setError(new Error(result.error));
                            setTasks([])
                        }else{
                            setTasks(result.data); 
                            setError(null);
                        }
                        
                        setLoading(false)    
                    }
                },
                (error) => {
                    if(!cancelled){
                        setError(error)
                        setLoading(false)   
                    } 
                }
            )
        
        return () => cancelled = true
    },[filters])    
    
    let actionItems = [
        {
            icon: FaPlus,
            text: 'Nueva tarea',
            route: `/tasks/new`,
            type: 'link'
        },
        {
            view: 'actionBar',
            type: 'form',         
            key: 'actionBarFilterForm',   
            initValues: {actionBarSearch: ''},
            onSubmit: searchHandler,
            validation: validation,
            items: [
                {
                    type: 'text',
                    id: 'actionBarSearch',
                    placeholder: 'Buscar...'
                },
                {        
                    id: 'filterBtn',
                    type: 'submit',
                    icon: FaFilter,
                    label: 'Filtrar',
                    className: 'button-icon'
                }
            ]
            
        },
        
    ]
     return (
        <BlockContainer>
            <BlockHeaderComponent 
                title='Tareas'
                actions={actions}
            />
            {loading && <Spinner />}            
            
            {tasks.length ? 
                (error!==null ? 
                    <div>Error: {error.message?error.message:'unknown error'}</div> 
                    :
                    tasks.map((item: TaskItem) => (
                        <TaskListItem key={item.id} task={item} />
                    ))
                )
                :
                <BlockEmptyComponent />
            }
        </BlockContainer>
        )
        
}