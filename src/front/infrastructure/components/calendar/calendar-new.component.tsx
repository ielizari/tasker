 import React from 'react'
import styled from 'styled-components'
import { Calendar, CalendarWeek, CalendarTime } from '../../../domain/calendar'
import { addCalendar } from '../../../application/addCalendar'
import { updateCalendar } from '../../../application/updateCalendar'
import { getCalendar } from '../../../application/getCalendar'
import { Link, useParams } from 'react-router-dom'
import { FaCheck, FaPlus, FaSave, FaTimes, FaTrashAlt} from 'react-icons/fa'
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
  StyledFieldArray,
  FormButtons,
} from '../common/form/form'
import { IconButton } from '../common/icon-button'

import '../../../../lib/orzkDatepicker/datepicker.css'
import { isValidDateTime, formattedDateToDate } from '../../../../lib/date.utils'
import { mapCalendarApiTocomponent } from '../../../application/dtos/calendarApiToComponent.dto'

const FormCheckboxWrapper = styled.div`
  // display: flex;
  // flex-direction: row;
  // align-items: center;
  // flex-grow: 2;
  label {
    align-items: center;
  }
`

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
    isHoliday: false,
    sunday: 0,
    monday: 0,
    tuesday: 0,
    wednesday: 0,
    thursday: 0,
    friday: 0,
    saturday: 0,
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
  const [time, setTime] = React.useState<CalendarTime | null>(null)

  const validate = (values) => {
    setTime(calculateTime(values))
    const errors : Partial<Calendar> = {}
    if(!values.title){
      errors.title = 'Campo obligatorio'
    }

    return errors
  }

  const calculateTime = (values: Calendar): CalendarTime => {
    const times = {
      expectedTotalTime: 0,
      currentExpectedTime: 0,
      workedTime: 0,
    }
    if (!values) return times;

    const initialTime = formattedDateToDate(values.workHours[0].startDate)
    const endTime = formattedDateToDate(values.workHours[0].endDate)
    if (!(initialTime && endTime)) return times;
    while(initialTime <= endTime) {
      const workhours = values.workHours.filter((range) => initialTime >= formattedDateToDate(range.startDate) && initialTime <= formattedDateToDate(range.endDate))
      if (workhours.length) {
        const item = workhours[workhours.length - 1];
        if (item && !item.isHoliday) {
          if (initialTime.getDay() === 0) times.expectedTotalTime += item.sunday
          if (initialTime.getDay() === 1) times.expectedTotalTime += item.monday
          if (initialTime.getDay() === 2) times.expectedTotalTime += item.tuesday
          if (initialTime.getDay() === 3) times.expectedTotalTime += item.wednesday
          if (initialTime.getDay() === 4) times.expectedTotalTime += item.thursday
          if (initialTime.getDay() === 5) times.expectedTotalTime += item.friday
          if (initialTime.getDay() === 6) times.expectedTotalTime += item.saturday
        }
      }
      initialTime.setDate(initialTime.getDate() + 1)
    }
    return times
  }

  React.useEffect(() => {
    setTime(calculateTime(calendar))
  }, [calendar])

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
              <div>Horas totales: {time?.expectedTotalTime || 0}</div>
              <div>Horas hasta la actualidad: {time?.currentExpectedTime || 0}</div>
              <div>
                <div>Horarios</div>
                <WorkHoursForm>
                  <FieldArray name="workHours">
                    {({remove, push}) => (
                      <div>
                        {values.workHours.map((week, index) => (
                          <WorkHoursItem key={index}>
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
                              <FormCheckbox
                                id={`workHours[${index}].isHoliday`}
                                name={`workHours[${index}].isHoliday`}
                                label="Vacaciones"
                                type="checkbox"
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