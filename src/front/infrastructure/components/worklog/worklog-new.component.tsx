 import React from 'react'
import { Worklog } from '../../../domain/worklog'
import { addWorklog } from '../../../application/addWorklog'
import { updateWorklog } from '../../../application/updateWorklog'
import { getWorklog } from '../../../application/getWorklog'
import { Link, useParams } from 'react-router-dom'
import { FaCheck, FaTimes} from 'react-icons/fa'
import { Spinner } from '../common/spinner'
import { BlockContainer, BlockHeaderComponent} from '../common/block'
import { SyncStateContext} from '../../../application/contexts/dbSyncContext'

import { FormBuilder } from '../common/form/form'

import '../../../../lib/orzkDatepicker/datepicker.css'
import { isValidDateTime } from '../../../../lib/date.utils'


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
    const syncCtx = React.useContext(SyncStateContext)
    const {setSync} = syncCtx

    const [submitSuccess, setSubmitSuccess] = React.useState(null)
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
                type: 'date',
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
                        helpers.setSubmitting(false); 
                        setLoading(false)
                        if(!result.hasError){
                            setSync({sync: false})
                            setSubmitSuccess(result.data.worklog);                                        
                            setError(null);
                            helpers.resetForm({})
                        }else{

                            setSubmitSuccess(null);
                            setError(new Error(result.error));                                      
                        }                        
                    },
                    (error) => {
                        console.log(error)
                        helpers.setSubmitting(false);
                        setSubmitSuccess(null);
                        setError(error);
                        setLoading(false)
                    }
                )
            }else if(mode === 'edit'){
                updateWorklog(values)
                .then(                            
                    (result) => {
                        helpers.setSubmitting(false); 
                        setLoading(false)
                        if(!result.hasError){              
                            setSync({sync: false})                          
                            setSubmitSuccess(result.data.worklog); 
                            setWorklog(null)                                     
                            setWorklog(result.data.worklog)                                        
                            setError(null);
                        }else{
                            setSubmitSuccess(null);
                            setError(new Error(result.error));                                      
                        }                        
                    },
                    (error) => {
                        console.log(error)
                        helpers.setSubmitting(false);
                        setSubmitSuccess(null);
                        setError(error);
                        setLoading(false)
                    }
                )
            }      
    }

    React.useEffect(()=> {
        setMode(props.mode)
    },[props.mode])

    React.useEffect(()=> {
        if(mode === 'edit'){
            setTitle('Editar parte')
        } else {
            setTitle('Nuevo parte')
        }
    },[mode])

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
                            setError(null)
                        }
                    
                        setLoading(false) 
                    }
                },
                (error) => {
                    console.log("error",error)
                    setSubmitSuccess(null)
                    setError(null)
                    setError(error)
                    setWorklog(null)
                    setLoading(false)
                }
            )        
        }else{
            setWorklog(emptyWorklog)
        }  
        return () => cancelled = true    
    },[worklogid, mode])

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

            {error &&
                <div aria-label='error-message' className='message-error'>{error.message}</div>
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