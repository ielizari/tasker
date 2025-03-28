import React from 'react'
import styled from 'styled-components'
import { color, common } from '../../../styles/theme';

import { TaskDetail } from '../../../domain/task-detail'
import { Calendar } from '../../../domain/calendar'
import { TaskStatus, TaskPriority, ConstObjectToSelectOptionsArray } from '../../../domain/task-definitions'
import { addTask } from '../../../application/addTask'
import { getTask } from '../../../application/getTask'
import { updateTask } from '../../../application/updateTask'
import { Link, useParams } from 'react-router-dom'
import { FaCheck, FaTimes, FaRedo, FaTrash} from 'react-icons/fa'
import { Spinner } from '../common/spinner'
import { BlockContainer, BlockHeaderComponent} from '../common/block'
import { SyncStateContext} from '../../../application/contexts/dbSyncContext'
import { CalendarListComponent } from '../calendar/calendar-list.component'

import {
    FormWrapper,
    FormTextInput,
    FormSelect,
    FormSelectFromComponent,
    FormDateInput,
    FormButtons, } from '../common/form/form'
    import { IconButton, IconLink } from '../common/icon-button'
import { Formik, Field, Form, ErrorMessage, FieldArray } from 'formik';
import { isValidDateTime } from '../../../../lib/date.utils'

import { mapTaskApiTocomponent } from '../../../application/dtos/taskApiToComponent.dto'

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
  tags: [],
  calendars: [],
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

const CalendarsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0.5rem;
  border: 1px solid ${color.grey};
`

const CalendarItem = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  margin: 0.5rem;
  div {
    flex-grow: 1;
  }
`
export interface TaskProps {
  taskid: string,
}

export const TaskNewComponent = (props) => {
    let { taskid } = useParams<TaskProps>()

    const syncCtx = React.useContext(SyncStateContext)
    const {setSync} = syncCtx

    const [submitSuccess, setSubmitSuccess] = React.useState(null)
    const [submitError, setSubmitError] = React.useState<Error | null>(null)
    const [mode, setMode] = React.useState(props.mode || 'new')
    const [task, setTask] = React.useState<TaskDetail | null>(null)
    const [error, setError] = React.useState<Error | null>(null)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [title, setTitle] = React.useState<string>('Nueva tarea')
    const [parentTask, setParentTask] = React.useState<TaskDetail | null>(null)

    const calendarSelectHandler = (calendar: Calendar, formValues) => {
      if (!formValues.calendars) {
        formValues.calendars = [calendar];
      } else {
        formValues.calendars.push(calendar)
      }
      return({
        value: calendar.id,
        label: calendar.title
      })
    }

    React.useEffect(()=> {
      if(mode === 'edit') setTitle('Editar tarea')
      else if(mode === 'child') setTitle('Nueva subtarea')
      else setTitle('Nueva tarea')
    },[mode])

    React.useEffect(()=> {
      setMode(props.mode)
    },[props.mode])

    React.useEffect(()=> {
      let cancelled = false
      if(taskid){
        setLoading(true)
        getTask(taskid)
        .then(
          (result) => {
            if(!cancelled){
              if(result.hasError){
                setError(new Error(result.error))
                setTask(null)
              }else{
                if(mode === 'edit'){
                  setTask(mapTaskApiTocomponent(result.data.task))
                }else{
                  setParentTask(mapTaskApiTocomponent(result.data.task))
                  let newTask = Object.assign({},emptyTask)
                  newTask.parent = result.data.task.id
                  setTask(newTask)
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
            setTask(null)
            setLoading(false)
          }
        )
      }else{
        setTask(emptyTask)
      }
      return () => {
        setTask(null);
        cancelled = true
      }
    },[mode,taskid])


    const statusItems = ConstObjectToSelectOptionsArray(TaskStatus)
    const priorityItems = ConstObjectToSelectOptionsArray(TaskPriority)

    const validate = (values) => {
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
      if(values.limitDate && !isValidDateTime(values.limitDate)){
        errors.limitDate = 'Formato de fecha y hora no válido'
      }

      return errors
    }
    const onSubmit = (values: TaskDetail, helpers) => {
      setLoading(true)
      const submitValues: TaskDetail = {
        id: values.id,
        parent: values.parent,
        title: values.title,
        description: values.description,
        createdDate: values.createdDate,
        limitDate: values.limitDate,
        author: values.author,
        authorId: values.authorId,
        status: values.status,
        priority: values.priority,
        tags: values.tags,
        calendars: values.calendars,
      }
      if(mode === 'new' || mode==='child'){
        addTask(submitValues)
          .then(
            (result) => {
              helpers.setSubmitting(false);
              setLoading(false)
              if(!result.hasError){
                setSubmitSuccess(result.data.task)
                setSubmitError(null)
                helpers.resetForm({})
                setSync({sync: false})
              }else{
                setSubmitSuccess(null);
                setSubmitError(new Error(result.error));
              }
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
        updateTask(submitValues)
          .then(
            (result) => {
              helpers.setSubmitting(false);
              setLoading(false)
              if(!result.hasError){
                setSubmitSuccess(result.data.task);
                setTask(null)
                setTask(result.data.task)
                setSubmitError(null);
                setSync({sync: false})
              }else{
                setSubmitSuccess(null);
                setSubmitError(new Error(result.error));
              }
            },
            (error) => {
              console.error(error)
              helpers.setSubmitting(false);
              setSubmitSuccess(null);
              setSubmitError(error);
              setLoading(false)
            }
          )
      }
    }

  return (
    <BlockContainer>
      <BlockHeaderComponent
        title={title}
      />
      {loading ? <Spinner /> : ''}
      {submitSuccess &&
        <div aria-label='success-message' className='message-success'>
          La {mode==='child' ? 'subtarea' : 'tarea'} <Link to={'/tasks/'+ submitSuccess.id}>'{submitSuccess.title}'</Link> ha sido {mode === 'new' ? 'creada':'editada'} con éxito.
        </div>
      }
      {submitError &&
        <div aria-label='error-message' className='message-error'>{submitError.message}</div>
      }
      {error &&
        <div aria-label='error-message' className='message-error'>{error.message}</div>
      }
      {parentTask &&
        <ParentTaskReference to={`/tasks/${parentTask.id}`}>
          Parent: {parentTask.title}
        </ParentTaskReference>
      }
      {task &&
        <Formik
          enableReinitialize
          initialValues={task}
          onSubmit={onSubmit}
          validate={validate}
        >
          {({ values }) => (
          <FormWrapper role="form">
            <FormTextInput
              name='title'
              label='Título'
              type='text'
            />
            <FormTextInput
              name='description'
              label='Descripción'
              type='text'
            />
            <FormTextInput
              name='author'
              label='Autor'
              type='text'
            />
            <FormDateInput
              id='limitDate'
              name='limitDate'
              label='Fecha límite'
              type='text'
            />
            <FormSelect
              label='Estado'
              selOptions={statusItems}
              id='status'
              name='status'
            />
            <FormSelect
              label='Prioridad'
              selOptions={priorityItems}
              id='priority'
              name='priority'
            />
            <div>Calendarios</div>
            <CalendarsContainer>
              <FormSelectFromComponent
                id='calendar_selector'
                name='calendar_selector'
                buttonLabel='Añadir calendario'
                component={CalendarListComponent}
                resultHandler={calendarSelectHandler}
                formValues={values}
                selectedLabel=''
              />
              <FieldArray name="calendars">
                {({remove, push}) => (
                  <>
                    {values.calendars?.map((calendar, index) => (
                      <CalendarItem key={index}>
                        <div>{calendar.title}</div>
                        <IconButton
                          type='button'
                          icon={FaTrash}
                          onClick={() => remove(index)}
                        />
                      </CalendarItem>
                    ))}
                  </>
                )}
              </FieldArray>
            </CalendarsContainer>
            <FormButtons>
              <IconButton
                type='submit'
                text='Guardar'
                icon={FaCheck}
                className='form-button-submit button-icon'
              />
              <IconButton
                type='reset'
                text='Reiniciar'
                icon={FaRedo}
                className='form-button-submit button-icon'
              />
              <IconLink
                type='link'
                route={taskid ? `/tasks/${taskid}` : '/tasks'}
                text='Cancelar'
                icon={FaTimes}
                className='form-button-cancel button-icon'
              />
            </FormButtons>
          </FormWrapper>
          )}
        </Formik>
      }

  </BlockContainer>
  )
}