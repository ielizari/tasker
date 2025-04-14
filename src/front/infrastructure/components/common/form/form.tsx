import React from 'react'
import styled from 'styled-components'
import { color, common, font } from '../../../../styles/theme';
import { Formik, Form, Field, FieldArray, useField, FieldProps } from 'formik'
import { IconButton, IconLink } from '../icon-button'
import { ModalWithComponent } from '../modal'
import Select, {Option, ReactSelectProps} from 'react-select'
import { FaCalendar } from 'react-icons/fa'
import  {Datepicker}  from '../../../../../lib/orzkDatepicker/datepicker'
import '../../../../../lib/orzkDatepicker/datepicker.css'

export const FormActionBarWrapper = styled(Form)`
    display: flex;
    flex-direction: row;
    color: ${color.black};
    flex-wrap: nowrap;
    flex-grow: 1;
`

export const FormWrapper = styled(Form)`
    display: flex;
    flex-direction: column;
    color: ${color.black};
    margin: 1rem;
`
export const StyledFieldArray = styled.div<{
  direction?:string,
  fullwidth?:boolean,
  border?:boolean,
}>`
    display: flex;
    flex-direction: ${props => props.direction || 'column'};
    border: 1px ${props => props.border ? 'solid' : 'none'} ${color.grey};
    padding: 0.5rem;
    margin: 0.3rem;
    input {
      max-width: ${props => props.fullwidth ? 'auto' : '4rem'};
      padding: 0.5rem;
      border-style: solid;
      border-width: 1px;
       border-color: ${color.grey};
      ${common.roundedCorners()};
    }
`

export const FormItemWrapper = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;
  margin: 0.5rem;
  flex-grow: 1;
`
export const FormItemWrapperInline = styled.div`
    display: flex;
    width: 100%;
    justify-content: center;
    flex-direction: row;
    margin: 0.5rem;
    align-items: center;
`
// const HiddenCheckbox = styled.input.attrs({ type: 'checkbox' })`
//   border: 0;
//   clip: rect(0 0 0 0);
//   clippath: inset(50%);
//   height: 1px;
//   margin: -1px;
//   overflow: hidden;
//   padding: 0;
//   position: absolute;
//   white-space: nowrap;
//   width: 1px;
// `
// const StyledCheckbox = styled.div`
//   display: inline-block;
//   width: 16px;
//   height: 16px;
//   background: ${(props:any) => props.checked ? 'salmon' : 'papayawhip'};
//   border-radius: 3px;
//   transition: all 150ms;
// `
// const CheckboxContainer = styled.div`
//   display: inline-block;
//   vertical-align: middle;
// `

export const FormButtons = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    margin: 1rem;
    gap: 1rem;

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

export const FormSelectIcon = styled.span`
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    padding: 0 .5rem;
    transition: background-color .3s;
    color: ${color.white} !important;
    background-color: #3333f1;
    ${common.roundedCornersLeft()}
    cursor: pointer;

    :hover {
        background-color: #5555ff;
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

export const FormNumberInput :React.FC<any> = ({label, ...props}) => {
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

export const FormSelectFromComponent : React.FC<any> = ({
  label,
  buttonLabel,
  selectedLabel,
  component,
  resultHandler,
  formValues,
  ...props
}) => {
    const [field, meta, {setValue, setTouched}] = useField(props)
    const [isOpened, setIsOpened] = React.useState<boolean>(false)
    const [selectLabel, setSelectLabel] = React.useState<string>(props.selectedLabel || '')

    React.useEffect(()=> {
      setSelectLabel(selectedLabel)
    },[selectedLabel])

    const hideWidget = () => {
      setIsOpened(false)
    }
    const showWidget = () => {
      setIsOpened(true)
    }
    const selectResultHandler = (result: any) => {
      let processed = resultHandler(result, formValues)
      setValue(processed.value)
      setSelectLabel(processed.label)
      setTouched(true)
      setIsOpened(false)
    }
    return (
      <FormItemWrapper>
        <ModalWithComponent
          isOpened={isOpened}
          onClose={hideWidget}
          Component={component}
          resultHandler={selectResultHandler}
        />
        <label htmlFor={props.id || props.name} >{label}</label>
        <input type="hidden" name={props.id} />
        <FormInputWithIconWrapper >
          <FormSelectIcon onClick={showWidget}>{buttonLabel}</FormSelectIcon>
          <Field type="hidden" {...field} {...props} />
          <input
            type="text"
            id={"select_label_"+props.id}
            name={"select_label_"+props.id}
            value={selectLabel}
            aria-label={"select_label_"+props.id}
            readOnly
          />
        </FormInputWithIconWrapper>
        {meta.touched && meta.error ? (
          <div aria-label={'validate_' + (props.id || props.name)} className="form-item-error">{meta.error}</div>
        ): null}
      </FormItemWrapper>
    )
}

export const FormDateInput :React.FC<any> = ({label, minDate, maxDate, ...props}) => {
    const [field, meta, {setValue, setTouched}] = useField(props)
    const [dp, setDp] = React.useState(null)

    const showDp = () => {
        dp.show()
    }
    const handleChange = React.useCallback(() => {
        setValue(dp.getFullDateString() || '')
        setTouched(true)
    },[setValue,setTouched,dp])

    React.useEffect(()=>{
        if(dp){
            dp.onSubmit = handleChange
        }
    },[dp, handleChange])

    React.useEffect(()=> {
        let options : any = {
          lang: 'es',
          ...(props.mode && { mode: props.mode}),
          ...(minDate && { minDate: minDate}),
          ...(maxDate && { maxDate: maxDate}),
        }
        let picker : Datepicker = new Datepicker(props.id,label,options)
        setDp(picker)
    },[label, minDate, maxDate, props.id, props.mode])

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

export const FormSelect: React.FC<ReactSelectProps & FieldProps> = ({ label, selOptions, handleSelect, ...props }) => {
  const [field, meta, {setValue}] = useField(props);
  const [options, setOptions] = React.useState(selOptions || [])

  const handleChange = (option: Option) => {
    if (handleSelect) handleSelect(option);
    setValue(option.value)
  }
  React.useEffect(() => {
    setOptions(selOptions)
  },[selOptions])

  const customStyles = {
    option: (provided, state) => ({
      ...provided,
      }),
    control: (provided, state) => ({
      ...provided,
      width: '100%',
      borderColor: `${color.grey}`,
      minHeight: '0',
      font: `${font.base()}`,
      padding: '0'
    }),
    singleValue: (provided, state) => {
      const opacity = state.isDisabled ? 0.5 : 1;
      const transition = 'opacity 300ms';
      const fontSize = '0.75rem'
      const padding = '0.5rem'

      return { ...provided, opacity, transition, fontSize, padding };
    },
    valueContainer: (provided, state) => ({
      ...provided,
      padding: '1px'
  }),
    dropdownIndicator: (provided, state) => ({
      ...provided,
      padding: '1px 8px'
    })
  }

  return (
    <FormItemWrapper data-testid={props.id}>
      <label htmlFor={props.id || props.name}>{label}</label>
      <Select
        options={selOptions}
        name={field.name}
        styles={customStyles}
        value={options ? options.find(option => option.value === field.value) : ''}
        onChange={handleChange}
        onBlur={field.onBlur}
        aria-label={field.name}
      />
      {meta.touched && meta.error ? (
        <div aria-label={'validate_' + (props.id || props.name)} className="form-item-error">{meta.error}</div>
      ) : null}
    </FormItemWrapper>
  );
  };

    export const FormCheckbox :React.FC<any> = ({label, ...props}) => {
      const [field, meta] = useField(props)

      return (
        <FormItemWrapperInline>
          <label>
              <Field type="checkbox" {...field} {...props} aria-label={props.id || props.name}/>
              {label && <label htmlFor={props.id || props.name}>{label}</label>}
          </label>
          {meta.touched && meta.error ? (
              <div aria-label={'validate_' + (props.id || props.name)} className="form-item-error">{meta.error}</div>
          ): null}
        </FormItemWrapperInline>
      )
    }

  export const FormFileupload: React.FC<any> = ({label, ...props}) => {
    const [field, meta,{setValue}] = useField(props)

    return(
      <FormItemWrapper>
        {label && <label htmlFor={props.id || props.name}>{label}</label>}
        <input
          {...props}
          name={field.name}
          type="file"
          onChange={(event)=>{
              setValue(event.currentTarget.files[0])
          }}
          key={props.key}
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
        setView(props.formView)
      },[props.formItems,props.formView])

      const renderFields = (item, path = '', itemIndex?) => {
        const currentPath = path ? `${path}.${item.id}` : item.id;
        if(item.type === 'group') {
          return (
            <StyledFieldArray
              key={`group-container_${currentPath}`}
              direction={item.direction}
              fullwidth={item.fullwidth}
              border={item.border}>
              {
                item.items.map((subitem, index) => (renderFields(subitem, path)))
              }
            </StyledFieldArray>
          )
        } else if(item.type === 'fieldset') {
          return (
            <div key={`fieldset-container_${currentPath}`}>
              {item.label && (<div>{item.label}</div>)}
              <FieldArray
                key={currentPath}
                name={currentPath}
                >
                  {({ insert, remove, push}) => (
                    <div>
                      <StyledFieldArray
                        direction={item.direction}
                        fullwidth={item.fullwidth}
                        border={item.border}>
                        {
                          item.items.map((subitem, index) => (renderFields(subitem, currentPath, index)))
                        }
                      </StyledFieldArray>
                      <button
                        onClick={() => push(item)}>
                        Nuevo
                      </button>
                    </div>
                  )}
              </FieldArray>
            </div>
            )

        }else if(item.type === 'text'){
          return(
            <FormTextInput
              id={currentPath}
              name={currentPath}
              key={currentPath}
              type="text"
              label={item.label}
              placeholder={item.placeholder}
            />
          )
        }else if (item.type === 'number'){
          return(
            <FormNumberInput
              id={currentPath}
              name={currentPath}
              key={currentPath}
              type="number"
              label={item.label}
              placeholder={item.placeholder}
            />
          )
        }else if(item.type === 'date'){
          return (
            <FormDateInput
              label={item.label}
              name={currentPath}
              key={currentPath}
              type="text"
              id={currentPath}
              mode={item.mode}
              />
          )
        }else if(item.type === 'select'){
          return (
            <FormSelect
              label={item.label}
              selOptions={item.selOptions}
              id={currentPath}
              name={currentPath}
              key={currentPath}
            />
          )
        }else if (item.type === 'checkbox'){
          return (
            <FormCheckbox
              label={item.label}
              name={currentPath}
              id={currentPath}
              key={currentPath}
            />
          )
        }else if(item.type === 'selectFromComponent'){
          return (
            <FormSelectFromComponent
              label={item.label}
              id={currentPath}
              name={currentPath}
              key={currentPath}
              selectedLabel={item.selectedLabel}
              component={item.component}
              buttonLabel={item.buttonLabel}
              resultHandler={item.resultHandler}
            />
          )
        }else if(item.type === 'file'){
          return(
            <FormFileupload
              label={item.label}
              id={currentPath}
              name={currentPath}
              key={currentPath}
              onChange={item.onChange}
            />
          )
        } else if(item.type === 'hidden'){
          return(
            <input
              type='hidden'
              name={currentPath}
              key={currentPath}
              value={item.value}
            />
          )
        } else if(item.type === 'button'){
          return(
            <IconButton
              key={currentPath}
              text={item.label}
              icon={item.icon}
              onClick={item.handler}
            />
          )
        } else if(item.type === 'buttons'){
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
        }else{
          return (<></>)
        }
      }

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
                        <FormActionBarWrapper role="form">
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
                                                mode={item.mode}
                                            />
                                        )
                                    }else if(item.type === 'select'){
                                        return (
                                            <FormSelect
                                                label={item.label}
                                                selOptions={item.selOptions}
                                                name={item.id}
                                                id={item.id}
                                                key={item.id}
                                            />
                                        )
                                    }else if (item.type === 'checkbox'){
                                        return (
                                            <FormCheckbox
                                                label={item.label}
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
                                    }else{
                                        return (<></>)
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
                {() =>  {
                    return (
                        <FormWrapper role="form">
                            {
                                items.map((item) => renderFields(item))
                            }
                        </FormWrapper>
                    )
                }}
            </Formik>
          }
          </>
      )
  }