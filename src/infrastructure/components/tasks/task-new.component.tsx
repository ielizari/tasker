import React from 'react'
import styled from 'styled-components'
import { color, common } from '../../../styles/theme';
import { Formik, Form, Field, useField } from 'formik'
import { TaskDetail } from '../../../domain/task-detail'
import { TaskStatus, TaskPriority, ConstObjectToSelectOptionsArray } from '../../../domain/task-definitions'
import { addTask } from '../../../application/addTask'
import { getTask } from '../../../application/getTask'
import { Link, useParams } from 'react-router-dom'
import { FaCheck, FaTimes, FaRedo, FaCalendar} from 'react-icons/fa'
import { IconButton, IconLink } from '../common/icon-button'
import { Spinner } from '../common/spinner'

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
const FormWrapper = styled(Form)`
    display: flex;
    flex-direction: column;
    color: ${color.black};
    margin: 1rem;
`
const FormItemWrapper = styled.div`
    display: flex;
    flex-direction: column;
    margin: 0.5rem;
`
const FormButtons = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;

`

const FormInputWithIconWrapper = styled.div`
    display: flex;
    flex-direction: row;
    border-width: 1px;
    border-color: ${color.grey};
    border-style: solid;
    ${common.roundedCorners()};
    
    & > input {
        width: 100%;
        border-style: none !important;
        padding: 0.5rem;
        ${common.roundedCorners()};
        margin: 0;
    }
`
const FormInputIcon = styled.span`
    display: inline-flex;
    align-items: center;
    padding: 0 .5rem;
    transition: background-color .3s;
    color: ${color.darkGrey} !important;
    background-color: ${color.lightGrey};
    ${common.roundedCornersLeft()}  
    cursor: pointer;

    :hover {
        background-color: ${color.semiLightGrey};
    }
`

const FormTextInput :React.FC<any> = ({label, ...props}) => {
    const [field, meta] = useField(props)
   
    return (
        <FormItemWrapper>
            <label htmlFor={props.id || props.name}>{label}</label>
            <Field {...field} {...props} aria-label={props.id || props.name}/>
            {meta.touched && meta.error ? (
                <div aria-label={'validate_' + (props.id || props.name)} className="form-item-error">{meta.error}</div>
            ): null}
        </FormItemWrapper>
    )
}

const FormDateInput :React.FC<any> = ({label, icon, handler, dateText, ...props}) => {
    const [field, meta, {setValue, setTouched}] = useField(props)
    const [inputIcon, setInputIcon] = React.useState(null)

    React.useEffect(()=> {
        setInputIcon(icon)
    },[])
    React.useEffect(()=>{
        console.log("Carga dateText",dateText)       
        setValue(dateText)
        setTouched(true)
    },[dateText])

    return (
        <FormItemWrapper>
            <label htmlFor={props.id || props.name}>{label}</label>
            <FormInputWithIconWrapper >
                {inputIcon ?
                    <FormInputIcon key={props.id || props.name + '_icon'} onClick={handler}>{inputIcon}</FormInputIcon>
                    :
                    ''
                }
                <Field 
                    {...field} 
                    {...props}    
                    aria-label={props.id || props.name}
                />
            </FormInputWithIconWrapper>
            {meta.touched && meta.error ? (
                <div aria-label={'validate_' + (props.id || props.name)} className="form-item-error">{meta.error}</div>
            ): null}
        </FormItemWrapper>
    )
}

const FormSelect: React.FC<any> = ({ label, selOptions, ...props }) => {
    const [field, meta] = useField(props);     
    return ( 
        <FormItemWrapper>
            <label htmlFor={props.id || props.name}>{label}</label> 
            <Field as="select" {...field} {...props} aria-label={props.id || props.name}>
                {
                    selOptions.map((item) =>
                        <option key={item.value} value={item.value}>{item.label}</option>
                    )
                }
            </Field> 
            {meta.touched && meta.error ? ( 
                <div aria-label={'validate_' + (props.id || props.name)} className="form-item-error">{meta.error}</div> 
            ) : null} 
        </FormItemWrapper>
    ); 
  };

  export interface TaskProps {
    taskid: string,
}

export const TaskNewComponent = (props) => {
    let { taskid } = useParams<TaskProps>()
    const [dpLimit,setDpLimit] = React.useState<Datepicker | null>(null)
    const [limitDate, setLimitDate] = React.useState<string>('')
    const [submitSuccess, setSubmitSuccess] = React.useState(null)
    const [submitError, setSubmitError] = React.useState(null)
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
            console.log("Carga en datepicker la fecha",task.limitDate,new Date(task.limitDate))       
            dp.setDate(new Date(task.limitDate))
        }
        console.log("Carga Datepicker limit")       
        setDpLimit(dp)

    },[task])

    React.useEffect(() => {   
        if(dpLimit && dpLimit.getDate() !== null){
            console.log("Carga limitdate")       
            setLimitDate(dpLimit.getFullDateString())
        }
    },[dpLimit])

    React.useEffect(()=> {       
        if(taskid){
            setLoading(true)
            getTask(taskid)
            .then(
                (result) => {  
                    if(mode === 'edit'){    
                        setTask(result.task) 
                    }else{
                        setParentTask(result.task)
                        emptyTask.parent = result.task.id
                        setTask(emptyTask)
                    }
                    setError(null)
                    setSubmitError(null)
                    setLoading(false) 
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
    },[])

    const dateHandler = () => {
        dpLimit.show()
    }

    const statusItems = ConstObjectToSelectOptionsArray(TaskStatus)
    const priorityItems = ConstObjectToSelectOptionsArray(TaskPriority)
    return (        
        <div className="block">   
            {loading ? <Spinner /> : ''}  
            <h3 className="section-title">{title}</h3>            
            {submitSuccess &&
                <div aria-label='success-message' className='message-success'>La tarea <Link to={'/tasks/'+ submitSuccess.id}>'{submitSuccess.title}'</Link> ha sido creada con éxito.</div>                
            }
            {submitError &&
                <div aria-label='error-message' className='message-error'>{submitError}</div>
            }
            {task &&
                <Formik
                    initialValues={task}               
                    validate = {values => {
                        console.log(values)
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
                        console.log(limitDate,values.limitDate, datetime)
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
                        }
                        
                        setLoading(true)
                        addTask(values)
                        .then(                            
                            (result) => {
                                setSubmitting(false);
                                setSubmitSuccess(result);
                                setSubmitError(null);
                                resetForm({})
                                setLoading(false)
                            },
                            (error) => {
                                setSubmitting(false);
                                setSubmitSuccess(null);
                                setSubmitError(error);
                                setLoading(false)
                            }
                        )      
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
                                type="text"                       
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
                                    disabled={props.isSubmitting && !props.isValidating}
                                    className="form-button-cancel button-icon"
                                    />
                            </FormButtons>
                        </FormWrapper>               
                    )}}  
                </Formik>
            }
        </div>
    )
}