import React from 'react'
import styled from 'styled-components'
import { color, common } from '../../../styles/theme';
import { FormWrapper, FormDateInput,FormSelect,FormTextInput, FormButtons} from '../common/form/form'
import { Formik, Form, Field, useField } from 'formik'
import { TaskDetail } from '../../../domain/task-detail'
import { TaskStatus, TaskPriority, ConstObjectToSelectOptionsArray } from '../../../domain/task-definitions'
import { addTask } from '../../../application/addTask'
import { getTask } from '../../../application/getTask'
import { updateTask } from '../../../application/updateTask'
import { Link, useParams } from 'react-router-dom'
import { FaCheck, FaTimes, FaRedo, FaCalendar} from 'react-icons/fa'
import { IconButton, IconLink } from '../common/icon-button'
import { Spinner } from '../common/spinner'
import { BlockContainer, BlockHeaderComponent} from '../common/block'

import  {Datepicker}  from '../../../lib/orzkDatepicker/datepicker'
import '../../../lib/orzkDatepicker/datepicker.css'


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
    const [dpLimit,setDpLimit] = React.useState<Datepicker | null>(null)
    const [limitDate, setLimitDate] = React.useState<string>('')
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

    React.useEffect(() => {        
        let dp = new Datepicker('limitDate','FechaLimite', {lang:'es'})
        dp.onSubmit = () => {   
            setLimitDate(dp.getFullDateString())         
            dp.printDate();
         }          

        if(task && task.limitDate !== '' && new Date(task.limitDate)){
            console.log(new Date().toString(),"Carga en datepicker la fecha",task.title,task.limitDate,new Date(task.limitDate))       
            dp.setDate(new Date(task.limitDate))
        }
        setDpLimit(dp)

    },[task])

    React.useEffect(() => {   
        if(dpLimit && dpLimit.getDate() !== null){    
            setLimitDate(dpLimit.getFullDateString())
        }
    },[dpLimit])

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
                                setTask(result.data.task) 
                            }else{
                                setParentTask(result.data.task)
                                emptyTask.parent = result.data.task.id
                                setTask(emptyTask)
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
                    setLimitDate('')
                    setLoading(false)
                }
            )        
        }else{
            setTask(emptyTask)
        }  
        return () => cancelled = true    
    },[])

    const dateHandler = () => {
        dpLimit.show()
    }

    const statusItems = ConstObjectToSelectOptionsArray(TaskStatus)
    const priorityItems = ConstObjectToSelectOptionsArray(TaskPriority)
    return (        
        <BlockContainer> 
            <BlockHeaderComponent 
                title={title}
            />  
            {loading ? <Spinner /> : ''}            
            {submitSuccess &&                
                <div aria-label='success-message' className='message-success'>                    
                    La {mode=='child' ? 'subtarea' : 'tarea'} <Link to={'/tasks/'+ submitSuccess.id}>'{submitSuccess.title}'</Link> ha sido {mode === 'new' ? 'creada':'editada'} con éxito.
                </div>  
            }
            {submitError &&
                <div aria-label='error-message' className='message-error'>{submitError.message}</div>
            }
            {parentTask &&
                <ParentTaskReference to={`/tasks/${parentTask.id}`}>
                    Parent: {parentTask.title}
                </ParentTaskReference>
            }
            {task &&
                <Formik
                    enableReinitialize
                    initialValues={task}               
                    validate = {values => {
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
                        
                        let datetime = values.limitDate.split(" ")
                        //console.log(limitDate,values.limitDate, datetime)
                        if(datetime.length > 0 && datetime.length !== 11 && datetime[0] !== ''){
                            if(!datetime[0].match(/^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([1][26]|[2468][048]|[3579][26])00))))$/g)){
                                errors.limitDate = 'Formato de fecha no válido'
                            }
                            if(datetime.length === 2 && !datetime[1].match(/^([0-1]?[0-9]|[2][0-3]):([0-5][0-9])(:[0-5][0-9])?$/)){
                                errors.limitDate = 'Formato de hora no válido'
                            }
                        }
                        return errors
                    }}
                    onSubmit = {(values,{setSubmitting, resetForm}) => {  
                        if(values.limitDate !== ''){
                            values.limitDate = (new Datepicker().createDate(values.limitDate)).toString()
                            console.log("Fechalimite",(new Datepicker().createDate(values.limitDate)).toString())
                        }
                        
                        setLoading(true)
                        if(mode === 'new' || mode=='child'){
                            addTask(values)
                            .then(                            
                                (result) => {
                                    if(!result.hasError){
                                        console.log(result.data.task)
                                        setSubmitSuccess(result.data.task);                                        
                                        setSubmitError(null);
                                        resetForm({})
                                    }else{
                                        setSubmitSuccess(null);
                                        setSubmitError(new Error(result.error));                                      
                                    }
                                    setSubmitting(false); 
                                    setLoading(false)
                                },
                                (error) => {
                                    console.log(error)
                                    setSubmitting(false);
                                    setSubmitSuccess(null);
                                    setSubmitError(error);
                                    setLoading(false)
                                }
                            )
                        }else if(mode === 'edit'){
                            updateTask(values)
                            .then(                            
                                (result) => {
                                    if(!result.hasError){                                        
                                        setSubmitSuccess(result.data.task); 
                                        setTask(null)                                     
                                        setTask(result.data.task)                                        
                                        setSubmitError(null);
                                    }else{
                                        setSubmitSuccess(null);
                                        setSubmitError(new Error(result.error));                                      
                                    }
                                    setSubmitting(false); 
                                    setLoading(false)
                                },
                                (error) => {
                                    console.log(error)
                                    setSubmitting(false);
                                    setSubmitSuccess(null);
                                    setSubmitError(error);
                                    setLoading(false)
                                }
                            )
                        }      
                    }}
                >                 
                    {props =>  {
                        return (      
                        <FormWrapper>
                            <FormTextInput 
                                label="Título"
                                name="title"
                                type="text"                             
                            />
                            <FormTextInput 
                                label="Descripción"
                                name="description"
                                type="text"                                
                            />
                            <FormTextInput 
                                label="Autor"
                                name="author"
                                type="text"                                
                            />   
                            <FormDateInput 
                                label="Fecha límite"
                                name="limitDate"
                                type="text"
                                id="limitDate"
                                icon={FaCalendar}
                                handler={dateHandler}   
                                dateText={limitDate}                    
                            />   
                            <FormSelect
                                label="Estado"
                                selOptions={statusItems}
                                name="status"                  
                            />   
                            <FormSelect
                                label="Prioridad"
                                selOptions={priorityItems}
                                name="priority"
                                type="text"                            
                            />                             
                            <FormButtons>                                
                                <IconButton
                                    key="btnSubmit"
                                    text="Guardar"
                                    icon={FaCheck}
                                    type="submit"
                                    disabled={props.isSubmitting && !props.isValidating}
                                    className="form-button-submit button-icon"
                                />
                                <IconButton 
                                    key="btnReset"
                                    text="Limpiar"
                                    icon={FaRedo}
                                    type="reset"
                                    disabled={props.isSubmitting && !props.isValidating}
                                    className="form-button-reset button-icon"
                                />
                                <IconLink 
                                    key="btnCancel"
                                    route={taskid ? `/tasks/${taskid}` : '/tasks'}
                                    text="Cancelar"
                                    icon={FaTimes}
                                    type="button"
                                    disabled={props.isSubmitting && !props.isValidating}
                                    className="form-button-cancel button-icon"
                                    />
                            </FormButtons>
                        </FormWrapper>               
                    )}}  
                </Formik>
            }
        </BlockContainer>
    )
}