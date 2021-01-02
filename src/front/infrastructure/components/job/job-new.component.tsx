import React from 'react'
import styled from 'styled-components'
import { color, font} from '../../../styles/theme'
import { FaCheck, FaTimes } from 'react-icons/fa'

import { Worklog } from '../../../domain/worklog'
import { Job } from '../../../domain/job'
import { FormBuilder } from '../common/form/form'
import { isValidDateTime } from '../../../../lib/date.utils'
import { BlockContainer, BlockHeaderComponent} from '../common/block'
import { Spinner } from '../common/spinner'
import { addJob } from 'src/front/application/addJob'

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
    const [worklog, setWorklog] = React.useState<Worklog>(props.worklog)
    const [job, setJob] = React.useState<Job>(emptyJob)    
    const [loading, setLoading] = React.useState<boolean>(false)
    const [title, setTitle] = React.useState<string>('Nuevo trabajo')
    const [submitError, setSubmitError] = React.useState<Error | null>(null)    
    const [mode, setMode] = React.useState(props.mode || 'new')

    React.useEffect(()=> {
        if(mode === 'edit'){
            setTitle('Editar trabajo')
        } else {
            setTitle('Nuevo trabajo')
        }
    },[mode])

    let formItems = [
        {
            type: 'text',
            id: 'title',
            label: 'Título'
        },
        {
            type: 'date2',
            id: 'startDatetime',
            label: 'Inicio'
        },
        {
            type: 'date2',
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
        setLoading(true)
        addJob(values).then(
            (result) => {
                helpers.setSubmitting(false); 
                setLoading(false)

                if(!result.hasError){                                 
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
    return (
        <BlockContainer> 
            <BlockHeaderComponent 
                title={title}
            />  
            {loading ? <Spinner /> : ''}          
            <FormBuilder 
                key = "newJobForm"
                formView = "form"
                formItems = {formItems}
                initValues = {job}
                validation = {validate}
                onSubmit = {onSubmit}
            />
        
        </BlockContainer>
    )
}