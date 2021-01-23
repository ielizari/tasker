import React from 'react'
import {
    ListContainer, 
    ListItem, 
    ListItemExpand, 
    ListItemTitleResult, 
    ListChildContainer,
    ListItemTitleLink
} from '../common/list'
import { TaskObject, TaskDetail, ConstObjectToSelectOptionsArray } from '../../../domain/task'
import { getTaskList } from '../../../application/getTaskList'
import styled from 'styled-components'
import { color, common } from '../../../styles/theme';
import { Link } from "react-router-dom";
import { FaFilter, FaPlus, FaMinus } from 'react-icons/fa'

import { Spinner } from '../common/spinner'

import { BlockHeaderComponent, BlockContainer, BlockEmptyComponent } from '../common/block'


const TaskListItem = (props: {item: TaskObject, resultHandler? } ) => {
    const [showChildren, setShowChildren] = React.useState<boolean>(false)  
    const [ childrenTasks, setChildrenTasks ] = React.useState<Array<TaskObject>>([])
    const [loading, setLoading] = React.useState<boolean>(false)
    
    const loadChildren = () => {
        getTaskList({parent: props.item.task.id})
            .then(
                (result) => {
                    if(result.hasError){
                        console.log(result.error);
                        setChildrenTasks([])
                    }else{
                        console.log(result)
                        setChildrenTasks(result.data)
                    }                        
                    setLoading(false)                        
                },
                (error) => {
                    console.log(error)
                    setLoading(false)   
                }
            )
        setShowChildren(!showChildren)
    }
    return(
        <>
            {loading && <Spinner />}
            <ListItem>
                <ListItemExpand onClick={loadChildren}>                    
                    {showChildren ?
                        <FaMinus />
                        :
                        <FaPlus />
                    }
                    ({props.item.childTasks.length})
                </ListItemExpand>
                {props.resultHandler ?
                    <ListItemTitleResult onClick={() => props.resultHandler(props.item.task)}>{props.item.task.title}</ListItemTitleResult> 
                    :
                    <ListItemTitleLink to={`/tasks/${props.item.task.id}`}>{props.item.task.title}</ListItemTitleLink>                     
                }           
            </ListItem>
            {showChildren && 
                <ListChildContainer>
                    <TaskListWidget tasks={childrenTasks} resultHandler={props.resultHandler}/>
                </ListChildContainer>
            }
        </>
    )
}

const TaskListWidget = (props: {tasks: Array<TaskObject>, resultHandler?}) => {
    return (
        <>
        {
            props.tasks.map((item: TaskObject) => (
                <TaskListItem key={item.task.id} item={item} resultHandler={props.resultHandler}/>
            ))            
        }
        </>
    )
}
export const TaskListComponent = (props) => {
    const [tasks, setTasks] = React.useState<Array<TaskObject>>([])
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
                        type: 'select',
                        id: 'actionBarOrder',
                        selOptions: ConstObjectToSelectOptionsArray( {
                            low:        { label: "Baja",    value: "1"},
                            medum:      { label: "Media",   value: "2"},
                            high:       { label: "Alta",    value: "3"},
                            extreme:    { label: "Extrema", value: "4"}
                        })
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
    
     return (
        <BlockContainer>
            <BlockHeaderComponent 
                title='Tareas'
                actions={actions}
            />
            {loading && <Spinner />}            
            
            <ListContainer>
            {tasks.length ? 
                (error!==null ? 
                    <div>Error: {error.message?error.message:'unknown error'}</div> 
                    :
                    <TaskListWidget tasks={tasks} resultHandler={props.resultHandler} />                    
                )
                :
                <BlockEmptyComponent />
            }
            </ListContainer>
        </BlockContainer>
        )
        
}