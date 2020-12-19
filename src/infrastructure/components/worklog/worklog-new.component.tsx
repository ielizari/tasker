 import React from 'react'
import styled from 'styled-components'
import { color, common } from '../../../styles/theme';
import { FormWrapper, FormDateInput,FormSelect,FormTextInput, FormButtons} from '../common/form/form'
import { Formik, Form, Field, useField } from 'formik'
import { Worklog } from '../../../domain/worklog'
import { addWorklog } from '../../../application/addWorklog'
import { updateWorklog } from '../../../application/updateWorklog'
import { TaskStatus, TaskPriority, ConstObjectToSelectOptionsArray } from '../../../domain/task-definitions'
import { getTask } from '../../../application/getTask'
import { Link, useParams } from 'react-router-dom'
import { FaCheck, FaTimes, FaRedo, FaCalendar} from 'react-icons/fa'
import { IconButton, IconLink } from '../common/icon-button'
import { Spinner } from '../common/spinner'
import { BlockContainer, BlockHeaderComponent} from '../common/block'

import { FormBuilder } from '../common/form/form'

import  {Datepicker}  from '../../../lib/orzkDatepicker/datepicker'
import '../../../lib/orzkDatepicker/datepicker.css'
import { isValidDateTime } from '../../../lib/date.utils'


const emptyWorklog: Worklog = {
    id: '',
    title: '',    
    startDatetime: '',
    endDatetime: '',
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

export interface WorklogProps {
    worklogid: string,
}

export const WorklogNewComponent = (props) => {
    let { worklogid } = useParams<WorklogProps>()
    const [dpStart,setDpStart] = React.useState<Datepicker | null>(null)
    const [startDate, setStartDate] = React.useState<string>('')
    const [dpEnd,setDpEnd] = React.useState<Datepicker | null>(null)
    const [endDate, setEndDate] = React.useState<string>('')
    const [submitSuccess, setSubmitSuccess] = React.useState(null)
    const [submitError, setSubmitError] = React.useState<Error | null>(null)
    const [mode, setMode] = React.useState(props.mode || 'new')
    const [worklog, setWorklog] = React.useState<Worklog | null>(null)
    const [error, setError] = React.useState<Error | null>(null)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [title, setTitle] = React.useState<string>('Nuevo registro')
    
    const dateHandler = () => {
        dpStart.show()
    }
    let formItems = 
         [
            {
                type: 'text',
                id: 'title',
                label: 'Título'
            },
            {
                type: 'date2',
                id: 'startDatetime',
                label: 'Fecha y hora de inicio',
                //icon: FaCalendar,
                //dateText: startDate,
                //handler: dateHandler
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
                        type: 'link',
                        route: '/worklogs',
                        icon: FaTimes,
                        label: 'Cancelar',
                        className: 'form-button-cancel button-icon'
                    }
                ]
            }            
         ]
    
    const validate = (values) => {
        const errors : Partial<Worklog> = {}
        console.log(values)
        if(!values.title){           
            console.log("No titulo")             
            errors.title = 'Campo obligatorio'
        }   
        
        if( values.startDatetime && !isValidDateTime(values.startDatetime)){
            console.log("No fecha")
            errors.startDatetime = 'Formato de fecha y hora no válido'
        }
       
        return errors
    }

    const onSubmit = (values, helpers) => {
        console.log(values)
        return false
        if(values.startDatetime !== ''){
            values.startDatetime = (new Datepicker().createDate(values.startDatetime)).toString()
        }
                        
        setLoading(true)
            if(mode === 'new'){
                addWorklog(values)
                .then(                            
                    (result) => {
                        if(!result.hasError){
                            setSubmitSuccess(result.data.task);                                        
                            setSubmitError(null);
                            helpers.resetForm({})
                        }else{
                            setSubmitSuccess(null);
                            setSubmitError(new Error(result.error));                                      
                        }
                        helpers.setSubmitting(false); 
                        setLoading(false)
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
                updateWorklog(values)
                .then(                            
                    (result) => {
                        if(!result.hasError){                                        
                            setSubmitSuccess(result.data.task); 
                            setWorklog(null)                                     
                            setWorklog(result.data.worklog)                                        
                            setSubmitError(null);
                        }else{
                            setSubmitSuccess(null);
                            setSubmitError(new Error(result.error));                                      
                        }
                        helpers.setSubmitting(false); 
                        setLoading(false)
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

    React.useEffect(()=> {
        if(mode === 'edit') setTitle('Editar registro')
        else setTitle('Nuevo registro')
    },[mode])

    React.useEffect(() => {        
        let dp = new Datepicker('startDate','StartDate', {lang:'es'})
        dp.onSubmit = () => {   
            setStartDate(dp.getFullDateString())         
            dp.printDate();
         }          

        if(worklog && worklog.startDatetime !== '' && new Date(worklog.startDatetime)){
            dp.setDate(new Date(worklog.startDatetime))
        }
        setDpStart(dp)

    },[worklog])

    React.useEffect(() => {   
        if(dpStart && dpStart.getDate() !== null){    
            setStartDate(dpStart.getFullDateString())
        }
    },[dpStart])

    React.useEffect(()=> {   
        let cancelled = false    
        if(worklogid){
            setLoading(true)
            getTask(worklogid)
            .then(
                (result) => { 
                    if(!cancelled){ 
                        if(result.hasError){
                            setError(new Error(result.error))
                            setWorklog(null)
                        }else{
                            if(mode === 'edit'){    
                                setWorklog(result.data.task) 
                            }else{                                
                                setWorklog(emptyWorklog)
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
                    setWorklog(null)
                    setStartDate('')
                    setLoading(false)
                }
            )        
        }else{
            setWorklog(emptyWorklog)
        }  
        return () => cancelled = true    
    },[])

    return (        
        <BlockContainer> 
            <BlockHeaderComponent 
                title={title}
            />  
            {loading ? <Spinner /> : ''}            
           
            {submitError &&
                <div aria-label='error-message' className='message-error'>{submitError.message}</div>
            }
            
            {worklog &&
                <FormBuilder 
                    key = "newWorklogForm"
                    formView = "form"
                    formItems = {formItems}
                    initValues = {emptyWorklog}
                    validation = {validate}
                    onSubmit = {onSubmit}
            />
            }
        </BlockContainer>
    )
}