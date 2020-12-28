 import React from 'react'
import styled from 'styled-components'
import { color, common } from '../../../styles/theme';
import { Worklog } from '../../../domain/worklog'
import { addWorklog } from '../../../application/addWorklog'
import { updateWorklog } from '../../../application/updateWorklog'
import { getWorklog } from '../../../application/getWorklog'
import { Link, useParams } from 'react-router-dom'
import { FaCheck, FaTimes} from 'react-icons/fa'
import { Spinner } from '../common/spinner'
import { BlockContainer, BlockHeaderComponent} from '../common/block'

import { FormBuilder } from '../common/form/form'

import  {Datepicker}  from '../../../../lib/orzkDatepicker/datepicker'
import '../../../../lib/orzkDatepicker/datepicker.css'
import { isValidDateTime, dateToFormattedDate, formattedDateToISOString } from '../../../../lib/date.utils'


const emptyWorklog: Worklog = {
    id: '',
    title: '',
    createdDate: '',    
    startDatetime: '',
    endDatetime: '',
    tags: []
}


export interface WorklogProps {
    worklogid: string,
}

export const WorklogNewComponent = (props) => {
    let { worklogid } = useParams<WorklogProps>()
    const [dpStart,setDpStart] = React.useState<Datepicker | null>(null)
    const [startDate, setStartDate] = React.useState<string>('')
    const [submitSuccess, setSubmitSuccess] = React.useState(null)
    const [submitError, setSubmitError] = React.useState<Error | null>(null)
    const [mode, setMode] = React.useState(props.mode || 'new')
    const [worklog, setWorklog] = React.useState<Worklog | null>(emptyWorklog)
    const [error, setError] = React.useState<Error | null>(null)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [title, setTitle] = React.useState<string>('Nuevo parte')
    
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
                label: 'Fecha y hora de inicio'
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
        if(!values.title){
            errors.title = 'Campo obligatorio'
        }   
        
        if(!values.startDatetime){
            errors.startDatetime = 'Campo obligatorio'
        }else if(!isValidDateTime(values.startDatetime)){
            errors.startDatetime = 'Formato de fecha y hora no válido'
        }
       
        return errors
    }

    const onSubmit = (values: Worklog, helpers) => {
                        
        setLoading(true)
            if(mode === 'new'){
                addWorklog(values)
                .then(                            
                    (result) => {
                        if(!result.hasError){
                            setSubmitSuccess(result.data.worklog);                                        
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
                            setSubmitSuccess(result.data.worklog); 
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
        console.log(mode)
        if(mode === 'edit'){
            setTitle('Editar parte')
        } else {
            setTitle('Nuevo parte')
        }
    },[mode])

    React.useEffect(() => {      
        let dp = new Datepicker('startDatetime','StartDate', {lang:'es'})
        dp.onSubmit = () => {   
            setStartDate(dp.getFullDateString())         
            dp.printDate()
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
            getWorklog(worklogid)
            .then(
                (result) => { 
                    if(!cancelled){ 
                        if(result.hasError){
                            setError(new Error(result.error))
                            setWorklog(null)
                        }else{
                            if(mode === 'edit'){                      
                                setWorklog(result.data.worklog) 
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
                    console.log("error",error)
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
           
            {submitSuccess &&                
                <div aria-label='success-message' className='message-success'>                    
                    El parte <Link to={'/worklogs/'+ submitSuccess.id}>'{submitSuccess.title}'</Link> ha sido {mode === 'new' ? 'creado':'editado'} con éxito.
                </div>  
            }

            {submitError &&
                <div aria-label='error-message' className='message-error'>{submitError.message}</div>
            }
            
            {worklog &&
                <FormBuilder 
                    key = "newWorklogForm"
                    formView = "form"
                    formItems = {formItems}
                    initValues = {worklog}
                    validation = {validate}
                    onSubmit = {onSubmit}
            />
            }
        </BlockContainer>
    )
}