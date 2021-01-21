import React from 'react'
import styled from 'styled-components'
import { color, common } from '../../../styles/theme';

import { TaskDetail } from '../../../domain/task-detail'
import { TaskStatus, TaskPriority, ConstObjectToSelectOptionsArray } from '../../../domain/task-definitions'
import { addTask } from '../../../application/addTask'
import { getTask } from '../../../application/getTask'
import { updateTask } from '../../../application/updateTask'
import { Link, useParams } from 'react-router-dom'
import { FaCheck, FaTimes, FaRedo} from 'react-icons/fa'
import { Spinner } from '../common/spinner'
import { BlockContainer, BlockHeaderComponent} from '../common/block'
import { SyncStateContext} from '../../../application/contexts/dbSyncContext'

import { FormBuilder } from '../common/form/form'
import { isValidDateTime } from '../../../../lib/date.utils'

import { mapTaskApiTocomponent } from '../../../application/dtos/taskApiToComponent.dto'

const emptyTask: TaskDetail = {
    id: '',
    title: '',
    description: '',    
    parent: '',    
    createdDate: '',
    limitDate: '',
    author: '',
    authorId: '',
    status: TaskStatus.pending.value,
    priority: TaskPriority.low.value,
    tags: []
}


  const ParentTaskReference = styled(Link)`
        display: flex;
        background-color: ${color.semiLightGrey};
        padding: 1rem;
        margin: 1rem;
        color: ${color.black} !important;
        border-style: solid;
        border-width: 1px;
        boder-color: ${color.blue};
        ${common.roundedCorners()};        
  `

  export interface TaskProps {
    taskid: string,
}

export const TaskNewComponent = (props) => {
    let { taskid } = useParams<TaskProps>()

    const syncCtx = React.useContext(SyncStateContext)
    const {setSync} = syncCtx
    
    const [submitSuccess, setSubmitSuccess] = React.useState(null)
    const [submitError, setSubmitError] = React.useState<Error | null>(null)
    const [mode, setMode] = React.useState(props.mode || 'new')
    const [task, setTask] = React.useState<TaskDetail | null>(null)
    const [error, setError] = React.useState<Error | null>(null)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [title, setTitle] = React.useState<string>('Nueva tarea')
    const [parentTask, setParentTask] = React.useState<TaskDetail | null>(null)
    
    React.useEffect(()=> {
        if(mode === 'edit') setTitle('Editar tarea')
        else if(mode === 'child') setTitle('Nueva subtarea')
        else setTitle('Nueva tarea')
    },[mode])

    React.useEffect(()=> {
        setMode(props.mode)
    },[props.mode])

    React.useEffect(()=> {   
        let cancelled = false    
        if(taskid){
            setLoading(true)
            getTask(taskid)
            .then(
                (result) => { 
                    if(!cancelled){ 
                        if(result.hasError){
                            setError(new Error(result.error))
                            setTask(null)
                        }else{
                            if(mode === 'edit'){
                                setTask(mapTaskApiTocomponent(result.data.task)) 
                            }else{
                                setParentTask(mapTaskApiTocomponent(result.data.task))
                                let newTask = Object.assign({},emptyTask)
                                newTask.parent = result.data.task.id
                                setTask(newTask)
                            }
                            setError(null)
                            setSubmitError(null)
                        }
                    
                        setLoading(false) 
                    }
                },
                (error) => {
                    setSubmitSuccess(null)
                    setSubmitError(null)
                    setError(error)
                    setTask(null)
                    setLoading(false)
                }
            )        
        }else{
            setTask(emptyTask)
        }  
        return () => {
            setTask(null); 
            cancelled = true   
        } 
    },[mode,taskid])

    
    const statusItems = ConstObjectToSelectOptionsArray(TaskStatus)
    const priorityItems = ConstObjectToSelectOptionsArray(TaskPriority)

    let formItems = 
        [
            {
                type: 'text',
                id: 'title',
                label: 'Título'
            },
            {
                type: 'text',
                id: 'description',
                label: 'Descripción'
            },
            {
                type: 'text',
                id: 'author',
                label: 'Autor'
            },
            {
                type: 'date',
                id: 'limitDate',
                label: 'Fecha límite'
            },
            {
                type: 'select',
                id: 'status',
                label: 'Estado',
                selOptions: statusItems
            },
            {
                type: 'select',
                id: 'priority',
                label: 'Prioridad',
                selOptions: priorityItems
            },            
            {
                type: 'buttons',
                buttons: [
                    {        
                        id: 'btnSubmit',
                        type: 'submit',
                        icon: FaCheck,
                        label: 'Guardar',
                        className: 'form-button-submit button-icon'
                    },
                    {        
                        id: 'btnReset',
                        type: 'reset',
                        icon: FaRedo,
                        label: 'Reiniciar',
                        className: 'form-button-submit button-icon'
                    },                    
                    {
                        id: 'cancelBtn',
                        type: 'link',
                        route: taskid ? `/tasks/${taskid}` : '/tasks',
                        icon: FaTimes,
                        label: 'Cancelar',
                        className: 'form-button-cancel button-icon'
                    }
                ]
            }            
        ]
        const validate = (values) => {
            const errors : Partial<TaskDetail> = {}
                        
            if(!values.title){                        
                errors.title = 'Campo obligatorio'
            }                    
            if(!values.author){
                errors.author = 'Campo obligatorio'
            }
            if(!values.status){
                errors.status = 'Campo obligatorio'
            }
            if(!values.priority){
                errors.priority = 'Campo obligatorio'
            }
            if(values.limitDate && !isValidDateTime(values.limitDate)){
                errors.limitDate = 'Formato de fecha y hora no válido'
            }
           
            return errors
        }
        const onSubmit = (values: TaskDetail, helpers) => {
            setLoading(true)
            if(mode === 'new' || mode==='child'){
                addTask(values)
                    .then(                            
                        (result) => {
                            helpers.setSubmitting(false); 
                            setLoading(false)
                            if(!result.hasError){
                                setSubmitSuccess(result.data.task)
                                setSubmitError(null)
                                helpers.resetForm({})
                                setSync({sync: false})
                            }else{
                                setSubmitSuccess(null);
                                setSubmitError(new Error(result.error));                                      
                            }                            
                        },
                        (error) => {
                            console.log(error)
                            helpers.setSubmitting(false);
                            setSubmitSuccess(null);
                            setSubmitError(error);
                            setLoading(false)
                        }
                    )
            }else if(mode === 'edit'){
                updateTask(values)
                    .then(                            
                        (result) => {
                            helpers.setSubmitting(false); 
                            setLoading(false)
                            if(!result.hasError){                                        
                                setSubmitSuccess(result.data.task); 
                                setTask(null)                                     
                                setTask(result.data.task)                                        
                                setSubmitError(null);
                                setSync({sync: false})
                            }else{
                                setSubmitSuccess(null);
                                setSubmitError(new Error(result.error));                                      
                            }                            
                        },                        
                        (error) => {
                            console.log(error)
                            helpers.setSubmitting(false);
                            setSubmitSuccess(null);
                            setSubmitError(error);
                            setLoading(false)
                        }
                    )
            }      
        }
    
    return (        
        <BlockContainer> 
            <BlockHeaderComponent 
                title={title}
            />  
            {loading ? <Spinner /> : ''}            
            {submitSuccess &&                
                <div aria-label='success-message' className='message-success'>                    
                    La {mode==='child' ? 'subtarea' : 'tarea'} <Link to={'/tasks/'+ submitSuccess.id}>'{submitSuccess.title}'</Link> ha sido {mode === 'new' ? 'creada':'editada'} con éxito.
                </div>  
            }
            {submitError &&
                <div aria-label='error-message' className='message-error'>{submitError.message}</div>
            }
            {error &&
                <div aria-label='error-message' className='message-error'>{error.message}</div>
            }
            {parentTask &&
                <ParentTaskReference to={`/tasks/${parentTask.id}`}>
                    Parent: {parentTask.title}
                </ParentTaskReference>
            }
            {task &&
                <FormBuilder 
                    key = "newTaskForm"
                    formView = "form"
                    formItems = {formItems}
                    initValues = {task}
                    validation = {validate}
                    onSubmit = {onSubmit}
                />
            }                
            
        </BlockContainer>
    )
}