import React from 'react'
import { FaCheck, FaTimes, FaTrash } from 'react-icons/fa'

import { Worklog } from '../../../domain/worklog'
import { Job } from '../../../domain/job'
import { TaskDetail } from '../../../domain/task'
import { FormBuilder } from '../common/form/form'
import { isValidDateTime } from '../../../../lib/date.utils'
import { BlockContainer, BlockHeaderComponent} from '../common/block'
import { Spinner } from '../common/spinner'
import { addJob } from 'src/front/application/addJob'
import { updateJob } from 'src/front/application/updateJob'
import { deleteJob } from 'src/front/application/deleteJob'
import { SyncStateContext} from '../../../application/contexts/dbSyncContext'
import { mapApiJobToComponent } from '../../../application/dtos/jobApiToComponent.dto'
import { isEmpty } from 'lodash'
import { TaskListComponent } from '../tasks/task-list.component'
import { getTask } from 'src/front/application/getTask'
import { Modal } from '../common/modal'

const emptyJob: Job = {    
        id: '',
        task: '',
        worklog: '',
        title: '',
        description: '',
        startDatetime: '',
        endDatetime: '',
        type: '',
        tags: []    
}

export const JobNewComponent = (props) => {
    const syncCtx = React.useContext(SyncStateContext)
    const {setSync} = syncCtx

    const [worklog, setWorklog] = React.useState<Worklog>(props.worklog)
    const [task, setTask] = React.useState<TaskDetail>(null)
    const [job, setJob] = React.useState<Job>(null)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [title, setTitle] = React.useState<string>('Nuevo trabajo')
    const [submitError, setSubmitError] = React.useState<Error | null>(null)    
    const [mode, setMode] = React.useState(props.mode || 'new')
    const [isOpened, setOpened] = React.useState<boolean>(false)

    React.useEffect(() => {
        setWorklog(props.worklog)
    },[props.worklog])

    React.useEffect(()=> {     
        if(props.job){
            if(!isEmpty(props.job.task)){
                setLoading(true)
                getTask(props.job.task).then(
                    result => {
                        setLoading(false)
                        if(!result.hasError){
                            setTask(result.data.task)
                        }else{
                            setTask(null)
                            console.log(result.error)
                        }
                        setJob(mapApiJobToComponent(props.job))
                        setMode('edit')                                           
                    },
                    error => {
                        setLoading(false)
                        console.log(error)
                    }
                )
            }else{
                setJob(mapApiJobToComponent(props.job))
                setMode('edit')  
            }
        }else{
            setJob(emptyJob)
            setMode('new')
        }       
    },[props.job])

    
    const closeModal = () => {  setOpened(false)}
    const openModal = () => { setOpened(true)}

    const handleDeleteJob = () => {
        if(job){
            setLoading(true)
            deleteJob(job.id).then(
                result => {
                    setLoading(false)
                    if(!result.hasError){
                        setSync({sync: false})
                        props.submit()
                    }else{
                        setSubmitError(new Error(result.error))
                    }
                },
                error => {
                    setLoading(false)
                    setSubmitError(new Error(error))
                }
            )
        }
    }

    React.useEffect(()=> {
        if(mode === 'edit'){
            setTitle('Editar trabajo')
        } else {
            setTitle('Nuevo trabajo')
        }
    },[mode])
    
    const taskSelectHandler = (task: TaskDetail) => {
        return({
            value: task.id,
            label: task.title
        })
    }

    let formItems = [
        {
            type: 'text',
            id: 'title',
            label: 'Título'
        },
        {
            id: 'task',
            type: 'selectFromComponent',
            label: 'Tarea',
            buttonLabel: 'Seleccione una tarea',
            component: TaskListComponent,
            resultHandler: taskSelectHandler,
            selectedLabel: task ? task.title : ''
        },
        {
            type: 'date',
            id: 'startDatetime',
            label: 'Inicio'
        },
        {
            type: 'date',
            id: 'endDatetime',
            label: 'Fin'
        },
        {
            type: 'buttons',
            buttons: [
                {        
                    id: 'submitBtn',
                    type: 'submit',
                    icon: FaCheck,
                    label: 'Guardar',
                    className: 'form-button-submit button-icon'
                },
                {
                    id: 'cancelBtn',
                    type: 'button',
                    onClick: props.cancel,
                    icon: FaTimes,
                    label: 'Cancelar',
                    className: 'form-button-cancel button-icon'
                },
                {
                    id: 'deleteBtn',
                    type: 'button',
                    onClick: openModal,
                    icon: FaTrash,
                    label: 'Borrar',
                    className: 'form-button-cancel button-icon'
                }
            ]
        }            
     ]

     const validate = (values) => {
        const errors : Partial<Job> = {}
        
        if(!values.startDatetime){
            errors.startDatetime = 'Campo obligatorio'
        }else if(!isValidDateTime(values.startDatetime)){
            errors.startDatetime = 'Formato de fecha y hora no válido'
        }
       
        if(values.strtDatetime && !isValidDateTime(values.startDatetime)){
            errors.startDatetime = 'Formato de fecha y hora no válido'
        }

        return errors
    }
    const onSubmit = (values: Job, helpers) => {
        values.worklog = worklog.id
        console.log(values)
        
        setLoading(true)
        if(mode === 'new'){
            addJob(values).then(
                (result) => {
                    helpers.setSubmitting(false); 
                    setLoading(false)

                    if(!result.hasError){    
                        setSync({sync: false})                             
                        setSubmitError(null)
                        helpers.resetForm({})
                        props.submit()
                    }else{
                        setSubmitError(new Error(result.error));                                      
                    }                
                },
                (error) => {
                    console.log(error)
                    helpers.setSubmitting(false);
                    setSubmitError(error);
                    setLoading(false)
                }
            )
        }else if(mode === 'edit'){
            updateJob(values).then(
                (result) => {
                    helpers.setSubmitting(false); 
                    setLoading(false)
                    console.log(result)
                    if(!result.hasError){    
                        setSync({sync: false})                             
                        setSubmitError(null)
                        helpers.resetForm({})
                        props.submit()
                    }else{
                        setSubmitError(new Error(result.error));                                      
                    }                
                },
                (error) => {
                    console.log(error)
                    helpers.setSubmitting(false);
                    setSubmitError(error);
                    setLoading(false)
                }
            )
        }
    }
    return (
        <BlockContainer>         
            <Modal 
                title="Eliminar tarea" 
                isOpened={isOpened} 
                onClose={closeModal}
                content="Esta acción es irreversible. ¿Desea continuar?"
                type="confirm"
                action={handleDeleteJob} />   
            <BlockHeaderComponent 
                title={title}
            />  
            {loading ? <Spinner /> : ''}

            {submitError &&
                <div aria-label='error-message' className='message-error'>{submitError.message}</div>
            }
            
            {job &&
                <FormBuilder 
                    key = "newJobForm"
                    formView = "form"
                    formItems = {formItems}
                    initValues = {job}
                    validation = {validate}
                    onSubmit = {onSubmit}
                />
            }
        
        </BlockContainer>
    )
}