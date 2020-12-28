import React from 'react'
import styled from 'styled-components'
import { color, common } from '../../../../styles/theme';
import { Formik, Form, Field, useField, useFormikContext } from 'formik'
import { IconButton, IconLink } from '../icon-button'

import { FaCalendar } from 'react-icons/fa'
import  {Datepicker}  from '../../../../../lib/orzkDatepicker/datepicker'
import '../../../../../lib/orzkDatepicker/datepicker.css'

export const FormActionBarWrapper = styled(Form)`
    display: inline-flex;
    flex-direction: row;
    color: ${color.black};
`

export const FormWrapper = styled(Form)`
    display: flex;
    flex-direction: column;    
    color: ${color.black};
    margin: 1rem;
`
export const FormItemWrapper = styled.div`
    display: flex;
    justify-content: center;
    flex-direction: column;
    margin: 0.5rem;
`
export const FormButtons = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 1rem;

`

export const FormInputWithIconWrapper = styled.div`
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
export const FormInputIcon = styled.span`
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

export const FormTextInput :React.FC<any> = ({label, ...props}) => {
    const [field, meta] = useField(props)
   
    return (
        <FormItemWrapper>
            {label && <label htmlFor={props.id || props.name}>{label}</label>}
            <Field {...field} {...props} aria-label={props.id || props.name}/>
            {meta.touched && meta.error ? (
                <div aria-label={'validate_' + (props.id || props.name)} className="form-item-error">{meta.error}</div>
            ): null}
        </FormItemWrapper>
    )
}

export const FormDateInput2 :React.FC<any> = ({label, ...props}) => {
    const [field, meta, {setValue, setTouched}] = useField(props)
    const [dp, setDp] = React.useState(null)
    
    const showDp = () => {
        dp.show()
    }
    
    React.useEffect(()=> {
        let picker : Datepicker = new Datepicker(props.id,label,{lang:'es'})
        picker.onSubmit = function(){
            setValue(this.getFullDateString())
            setTouched(true)
        }
        setDp(picker)
    },[])
    
    return (
        <FormItemWrapper>
            <label htmlFor={props.id || props.name} >{label}</label>
            <FormInputWithIconWrapper >                
                <FormInputIcon onClick={showDp}><FaCalendar/></FormInputIcon>
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

export const FormDateInput :React.FC<any> = ({label, icon, handler, dateText, ...props}) => {
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

export const FormSelect: React.FC<any> = ({ label, selOptions, ...props }) => {
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

  export const FormFileupload: React.FC<any> = ({label, ...props}) => {
      const [field, meta,{setValue,setTouched}] = useField(props)
      const {setFieldValue} = useFormikContext()
      
        return(
            <FormItemWrapper>
                {label && <label htmlFor={props.id || props.name}>{label}</label>}            
                <input 
                    {...props}
                    type="file" 
                    onChange={(event)=>{
                        setFieldValue(props.id,event.currentTarget.files[0])
                    }}
                    key={props.key}
                    name={props.name}            
                    aria-label={props.id || props.name} />
                {meta.touched && meta.error ? (
                    <div aria-label={'validate_' + (props.id || props.name)} className="form-item-error">{meta.error}</div>
                ): null}
            </FormItemWrapper>
        )
  }
  export interface TaskFilterForm {
      search: string
      minDate: Date
      maxDate: Date
      orderBy: string      
  }

  export interface FormItemType {
        type: 'text' | 'date' | 'select' | 'button' | 'checkbox' | 'textarea' | 'number' | 'submit' | 'reset'
        id: string
        label: string
        icon?: any
        handler?: any
        dateText?: any
        placeholder?: string
        selectOptions?: any
        className?: string
  }

  export interface FormTextType extends FormItemType{
        placeholder: string
  }

  export interface FormDateType extends FormItemType{
        icon: any
        handler: any
        dateText: any
  }

  export interface FormSelectType extends FormItemType{
        selectOptions: any      
  }
  export interface FormButtonType extends FormItemType{
        className: string
  }


  //export const FormBuilder: React.FC<any> = ({formView, formItems, initValues, validation, onSubmit, ...props}) => {
export const FormBuilder: React.FC<any> = (props) => {
      const [items, setItems] = React.useState(props.formItems || null)
      const [view, setView ] = React.useState(props.formView || null)

      React.useEffect(() => {
        setItems(props.formItems)
      },[])

      return (
          <>
          {view === 'actionBar' ?
            
            <Formik
                enableReinitialize
                initialValues={props.initValues}               
                validate = {props.validation}
                onSubmit = {(values,{setSubmitting, resetForm}) => {  
                    props.onSubmit(values,{setSubmitting, resetForm})
                }}            
            >
                {(props) =>  {
                    return (                           
                        <FormActionBarWrapper>
                            {
                                items.map((item) => {
                                    if(item.type === 'text'){                                        
                                        return(
                                            <FormTextInput 
                                                name={item.id}
                                                id={item.id}
                                                key={item.id}
                                                type="text"
                                                placeholder={item.placeholder}                           
                                            />
                                        )
                                    }else if(item.type === 'date'){
                                        return (
                                            <FormDateInput 
                                                    label={item.label}
                                                    name={item.id}
                                                    key={item.id}
                                                    type="text"
                                                    id={item.id}
                                                    icon={item.icon}
                                                    handler={item.handler}   
                                                    dateText={item.dateText}                    
                                                />   
                                        )
                                    }else if(item.type === 'select'){
                                        return (
                                            <FormSelect
                                                label={item.label}
                                                selOptions={item.selectOptions}
                                                name={item.id}
                                                id={item.id}
                                                key={item.id}        
                                            />   
                                        )
                                    }else if(item.type === 'file'){
                                        return(
                                            <FormFileupload
                                                label={item.label}
                                                id={item.id}
                                                name={item.id}
                                                key={item.id}
                                                onChange={item.onChange}                                      
                                            />
                                        )
                                    
                                    }else if(item.type === 'submit'){
                                        return (
                                            <IconButton
                                                    key={item.id}
                                                    text={item.label}
                                                    icon={item.icon}
                                                    type="submit"
                                                    className={item.className}
                                                />
                                        )
                                    }
                                })
                            }
                        </FormActionBarWrapper>                        
                    )
                }}
            </Formik>  
            :
            <Formik
                enableReinitialize
                initialValues={props.initValues}               
                validate = {props.validation}
                onSubmit = {(values,{setSubmitting, resetForm}) => {
                    props.onSubmit(values,{setSubmitting, resetForm})
                }}            
            >
                {props =>  {
                    return (                           
                        <FormWrapper>
                            {
                                items.map((item) => {
                                    if(item.type === 'text'){                                        
                                        return(
                                            <FormTextInput 
                                                id={item.id}
                                                name={item.id}
                                                key={item.id}
                                                type="text"
                                                label={item.label}
                                                placeholder={item.placeholder}                           
                                            />
                                        )
                                    }else if(item.type === 'date'){
                                        return (
                                            <FormDateInput 
                                                    label={item.label}
                                                    name={item.id}
                                                    key={item.id}
                                                    type="text"
                                                    id={item.id}
                                                    icon={item.icon}
                                                    handler={item.handler}   
                                                    dateText={item.dateText}                    
                                                />   
                                        )
                                    }else if(item.type === 'date2'){
                                            return (
                                                <FormDateInput2
                                                        label={item.label}
                                                        name={item.id}
                                                        key={item.id}
                                                        type="text"
                                                        id={item.id}                                                                        
                                                    />   
                                            )
                                    }else if(item.type === 'select'){
                                        return (
                                            <FormSelect
                                                label={item.label}
                                                selOptions={item.selectOptions}
                                                id={item.id}
                                                name={item.id}
                                                key={item.id}        
                                            />   
                                        )
                                    }else if(item.type === 'file'){
                                        return(
                                            
                                            <FormFileupload
                                                label={item.label}
                                                id={item.id}
                                                name={item.id}
                                                key={item.id}
                                                onChange={item.onChange}
                                            />
                                        )
                                    }else if(item.type === 'buttons'){
                                        return (
                                            <FormButtons key="form_buttons">
                                            {
                                                item.buttons.map((button) => {
                                                    if(button.type === 'submit'){
                                                        return (
                                                            <IconButton
                                                                    key={button.id}
                                                                    text={button.label}
                                                                    icon={button.icon}
                                                                    type="submit"
                                                                    className={button.className}
                                                                />
                                                        )
                                                    }else if(button.type === 'link'){
                                                        return (
                                                            <IconLink 
                                                                key={button.id}
                                                                text={button.label}
                                                                icon={button.icon}
                                                                route={button.route}
                                                                type="button"
                                                                className={button.className}
                                                            />
                                                        )
                                                    }else{
                                                        return (
                                                            <IconButton 
                                                                key={button.id}
                                                                text={button.label}
                                                                icon={button.icon}
                                                                onClick={button.onClick}
                                                                type="button"
                                                                className={button.className}
                                                            />
                                                        )
                                                    }
                                                }) 
                                            }
                                            </FormButtons>         
                                        )                              
                                    }
                                    
                                })
                            }
                        </FormWrapper>                        
                    )
                }}
            </Formik>  
          }
          </>
      )
  }