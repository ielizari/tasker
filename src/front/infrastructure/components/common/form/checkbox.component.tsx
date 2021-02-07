import React from 'react'
import styled from 'styled-components'
import { Field, useField } from 'formik'

export const FormItemWrapperInline = styled.div`
    display: flex;
    width: 100%;
    justify-content: center;
    flex-direction: row;
    margin: 0.5rem;
`

export const FormCheckbox :React.FC<any> = ({label, ...props}) => {
    const [field, meta] = useField(props)

    return (
        <FormItemWrapperInline>                
            <Field type="checkbox" {...field} {...props} aria-label={props.id || props.name}/>
            {label && <label htmlFor={props.id || props.name}>{label}</label>}
            {meta.touched && meta.error ? (
                <div aria-label={'validate_' + (props.id || props.name)} className="form-item-error">{meta.error}</div>
            ): null}
        </FormItemWrapperInline>
    )
}