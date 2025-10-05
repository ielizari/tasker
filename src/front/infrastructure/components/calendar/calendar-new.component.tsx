 import React from 'react'
import styled from 'styled-components'
import { Calendar, CalendarWeek, NonWorkingOptions } from '../../../domain/calendar'
import { addCalendar } from '../../../application/addCalendar'
import { updateCalendar } from '../../../application/updateCalendar'
import { getCalendar } from '../../../application/getCalendar'
import { Link, useParams } from 'react-router-dom'
import { FaPlus, FaSave, FaTrashAlt} from 'react-icons/fa'
import { Spinner } from '../common/spinner'
import { BlockContainer, BlockHeaderComponent} from '../common/block'
import { SyncStateContext} from '../../../application/contexts/dbSyncContext'
import { Formik, FieldArray } from 'formik';
import {
  FormWrapper,
  FormTextInput,
  FormNumberInput,
  FormCheckbox,
  FormDateInput,
  FormButtons,
  FormSelect,
} from '../common/form/form'
import { IconButton } from '../common/icon-button'

import '../../../../lib/orzkDatepicker/datepicker.css'
import { mapCalendarApiTocomponent } from '../../../application/dtos/calendarApiToComponent.dto'

const WorkHoursForm = styled.div`
  border: 1px solid grey;
  .week-hours__dates {
    display: flex;
    flex-direction: row;

    &>div {
      width: 100%;
    }
  }
  .week-hours__days {
    display: flex;
    flex-direction: row;
    text-align: center;

    input {
      text-align: center;
      width: 100%;
    }
  }
`

const WorkHoursItem = styled.div`
  border: 1px solid grey;
  margin: 0.5rem;
`

const getWorkHoursItem = (): CalendarWeek => {
  return {
    startDate: '',
    endDate: '',
    nonWorking: null,
    sunday: 0,
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
    title: '',
    priority: 1,
  }
}

const emptyCalendar: Calendar = {
  id: '',
  title: '',
  enabled: false,
  startDate: '',
  endDate: '',
  workHours:  [ getWorkHoursItem() ],
  eligibleHolidays: 0,
}


export interface CalendarProps {
  calendarid: string,
}

export const CalendarNewComponent = (props) => {
  let { calendarid } = useParams<CalendarProps>()
  const syncCtx = React.useContext(SyncStateContext)
  const {setSync} = syncCtx

  const [submitSuccess, setSubmitSuccess] = React.useState<Calendar>(null)
  const [mode, setMode] = React.useState(props.mode || 'new')
  const [calendar, setCalendar] = React.useState<Calendar | null>(null)
  const [error, setError] = React.useState<Error | null>(null)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [title, setTitle] = React.useState<string>('Nuevo calendario')

  const validate = (values) => {
    const errors : Partial<Calendar> = {}
    if(!values.title){
      errors.title = 'Campo obligatorio'
    }

    return errors
  }

  const onSubmit = (values: Calendar, helpers) => {

    setLoading(true)
      if(mode === 'new'){
        addCalendar(values)
        .then(
          (result) => {
            helpers.setSubmitting(false);
            setLoading(false)
            if(!result.hasError){
              setSync({sync: false})
              setSubmitSuccess(result.data.calendar);
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
        updateCalendar(values)
        .then(
          (result) => {
            helpers.setSubmitting(false);
            setLoading(false)
            if(!result.hasError){
              setSync({sync: false})
              setSubmitSuccess(result.data);
              setCalendar(null)
              setCalendar(mapCalendarApiTocomponent(result.data))
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
      setTitle('Editar calendario')
    } else {
      setTitle('Nuevo calendario')
    }
  },[mode])

  React.useEffect((): void => {
    let cancelled = false
    if(calendarid){
      setLoading(true)
      getCalendar(calendarid)
      .then(
        (result) => {
          if(!cancelled){
            if(result.hasError){
              setError(new Error(result.error))
              setCalendar(null)
            }else{
              if(mode === 'edit'){
                setCalendar(mapCalendarApiTocomponent(result.data))
              }else{
                setCalendar(emptyCalendar)
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
          setCalendar(null)
          setLoading(false)
        }
      )
    }else{
      setCalendar(emptyCalendar)
    }
  },[calendarid, mode])

  return (
    <BlockContainer>
      <BlockHeaderComponent
        title={title}
      />
      {loading ? <Spinner /> : ''}

      {submitSuccess &&
        <div aria-label='success-message' className='message-success'>
          El calendario <Link to={'/calendars/'+ submitSuccess.id}>'{submitSuccess.title}'</Link> ha sido {mode === 'new' ? 'creado':'editado'} con éxito.
        </div>
      }

      {error &&
        <div aria-label='error-message' className='message-error'>{error.message}</div>
      }

      {calendar &&
        <Formik
          enableReinitialize
          initialValues={calendar}
          onSubmit={onSubmit}
          validate={validate}
        >
          {({ values }) => (
            <FormWrapper>
              <FormTextInput
                name='title'
                label='Título'
                type='text'
              />
              <FormCheckbox
                name="enabled"
                label="Activo"
                type='checkbox'
              />
              <FormDateInput
                id="startDate"
                name="startDate"
                label="Fecha de inicio"
                type="text"
              />
              <FormDateInput
                id="endDate"
                name="endDate"
                label="Fecha de fin"
                type="text"
              />
              <FormNumberInput
                name='eligibleHolidays'
                label='Vacaciones a elegir'
                type='number'
              />
              <div>
                <div>Horarios</div>
                <WorkHoursForm>
                  <FieldArray name="workHours">
                    {({remove, push}) => (
                      <div>
                        {values.workHours.map((week, index) => (
                          <WorkHoursItem key={index}>
                             <FormTextInput
                                name={`workHours[${index}].title`}
                                label='Título'
                                type='text'
                              />
                            <div className='week-hours__dates'>
                              <FormDateInput
                                id={`workHours[${index}].startDate`}
                                name={`workHours[${index}].startDate`}
                                label="Fecha de inicio"
                                type="text"
                              />
                              <FormDateInput
                                id={`workHours[${index}].endDate`}
                                name={`workHours[${index}].endDate`}
                                label="Fecha de fin"
                                type="text"
                              />
                              <FormSelect
                                label='No laborable'
                                selOptions={NonWorkingOptions}
                                id={`workHours[${index}].nonWorking`}
                                name={`workHours[${index}].nonWorking`}
                              />
                              <FormNumberInput 
                                id={`workHours[${index}].priority`}
                                name={`workHours[${index}].priority`}
                                label="Prioridad"
                                type="number"
                              />
                            </div>
                            <div className='week-hours__days'>
                              <FormNumberInput
                                name={`workHours[${index}].monday`}
                                label='Lunes'
                                type='number'
                              />
                              <FormNumberInput
                                name={`workHours[${index}].tuesday`}
                                label='Martes'
                                type='number'
                              />
                              <FormNumberInput
                                name={`workHours[${index}].wednesday`}
                                label='Miércoles'
                                type='number'
                              />
                              <FormNumberInput
                                name={`workHours[${index}].thursday`}
                                label='Jueves'
                                type='number'
                              />
                              <FormNumberInput
                                name={`workHours[${index}].friday`}
                                label='Viernes'
                                type='number'
                              />
                              <FormNumberInput
                                name={`workHours[${index}].saturday`}
                                label='Sábado'
                                type='number'
                              />
                              <FormNumberInput
                                name={`workHours[${index}].sunday`}
                                label='Domingo'
                                type='number'
                              />
                            </div>
                            <FormButtons>
                              <IconButton
                                text="Borrar"
                                icon={FaTrashAlt}
                                onClick={() => remove(index)}
                              />
                            </FormButtons>
                          </WorkHoursItem>
                          )
                        )}
                        <IconButton
                          text="Añadir"
                          icon={FaPlus}
                          onClick={() => { push(getWorkHoursItem())}}
                        />
                      </div>
                    )}
                  </FieldArray>
                </WorkHoursForm>
              </div>
              <FormButtons>
                <IconButton
                    text='Guardar'
                    icon={FaSave}
                    type="submit"
                  />
              </FormButtons>
            </FormWrapper>
          )}
        </Formik>
      }
    </BlockContainer>
  )
}