import React from 'react'
import styled from 'styled-components'
import { color, common } from '../../../styles/theme'
import { useParams} from 'react-router-dom'
import { TaskObject } from '../../../domain/task-detail'
import { TaskPriority, TaskStatus, ConstObjectToSelectOptionsArray } from '../../../domain/task-definitions'
import { getTask } from '../../../application/getTask'
import { getTaskGroupedData } from '../../../application/getTaskGroupedData'
import { deleteTask } from '../../../application/deleteTask'
import { Spinner } from '../common/spinner'
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa'
import { Modal } from '../common/modal'
import { Link } from 'react-router-dom'
import { dateToFormattedDate } from '../../../../lib/date.utils'
import { BlockContainer, BlockHeaderComponent } from '../common/block'
import { SyncStateContext} from '../../../application/contexts/dbSyncContext'
import { StatsTotalSpentTimeComponent } from '../statistics/stats-total-spent-time.component'
import { GroupedNode } from '../worklog/worklog-grouped.component'

const TaskDetailContainer = styled.ul`
`;
const TaskDetailKey = styled.div`
  font-weight: bold;
  color: ${color.black};
  flex-basis: 10rem;
`;
const TaskDetailValue = styled.div`
  color: ${color.black}
`;

const TaskDetailItem = styled.li`
  display: flex;
  flex-direction: vertical;
  margin: 1rem;
`;

const ErrorMessage = styled.div`
  background-color: ${color.lightRed};
  padding: 1rem;
  text-align: center;
  color: ${color.white};
  margin: 0.5rem;
`;

const TaskChildrenContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  & a{
    display: inline-flex;
    background-color: ${color.orange};
    ${common.roundedCorners()};
    padding: 0.5rem;
  }

  & a:hover {
    background-color: ${color.lightOrange};
  }
`

const TaskTagsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;

  & div{
    display: inline-flex;
    background-color: rgba(0,0,0,0.7);
    color: ${color.white};
    ${common.roundedCorners()};
    padding: 0.5rem;
  }
`

export interface TaskProps {
  taskid: string,
}
export const TaskDetailComponent = (props) => {
  let { taskid } = useParams<TaskProps>()
  const syncCtx = React.useContext(SyncStateContext)
  const {setSync} = syncCtx

  const [task, setTask] = React.useState<TaskObject | null>(null)
  const [error, setError] = React.useState<Error | null>(null)
  const [deleteSuccess, setDeleteSuccess] = React.useState<string | null>(null)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [actions, setActions] = React.useState<Array<any>>([])
  const [isOpened, setOpened] = React.useState(false)
  const [statusLabel, setStatusLabel ] = React.useState<string>('')
  const [priorityLabel, setPriorityLabel ] = React.useState<string>('')
  const [confirmedDelete, setConfirmedDelete ] = React.useState<boolean>(false)
  const [groupedData, setGroupedData] = React.useState(null)

  const handleDelete = () => {
    setOpened(false)
    setLoading(true)
    setConfirmedDelete(true)
  }

  React.useEffect(() : void => {
    let cancelled = false
    if(confirmedDelete){
      deleteTask(taskid)
      .then(
        result => {
          if(!cancelled){
            if(!result.hasError){
              setSync({sync: false})
              setDeleteSuccess('La tarea se ha eliminado con éxito')
            }else{
              setError(new Error('Ha ocurrido un error al eliminar la tarea.'))
            }
            setLoading(false)
          }
        },
        error => {
          console.log("Error: ", error)
          setError(new Error('Ha ocurrido un error al eliminar la tarea.'))
          setLoading(false)
        }
      )
    }
  },[confirmedDelete,taskid,setSync])

  const closeModal = () => {  setOpened(false)}
  const openModal = () => { setOpened(true)}

  React.useEffect((): void => {
    let cancelled = false;
    let actionItems = [
      {
        icon: FaEdit,
        text: 'Editar',
        route: `/tasks/edit/${taskid}`,
        type: 'link'
      },
      {
        icon: FaTrashAlt,
        text: 'Borrar',
        type: 'button',
        handler: openModal
      },
      {
        icon: FaPlus,
        text: 'Subtarea',
        route: `/tasks/new/${taskid}`,
        type: 'link'
      }
    ]
    setActions(actionItems)
    setLoading(true)
    getTask(taskid)
      .then(
        (result) => {
          if(!cancelled){
            if(result.hasError){
              setError(new Error(result.error))
              setTask(null)
            }else{
              console.log(result.data)
              getTaskGroupedData(taskid).then(
                result => {
                  console.log("wadafak",result)
                  setGroupedData(result.data)
                },
                error => {

                }
              )

              let status = ConstObjectToSelectOptionsArray(TaskStatus).filter(i => i.value === result.data.task.status)
              setStatusLabel(status.length ? status[0].label : '')
              let priority = ConstObjectToSelectOptionsArray(TaskPriority).filter(i => i.value === result.data.task.priority)
              setPriorityLabel(priority.length ? priority[0].label : '')
              setTask(result.data)
              setError(null)
            }

            setLoading(false)
          }
        },
        (error) => {
          if(!cancelled){
            setError(error)
            setTask(null)
            setLoading(false)
          }
        }
      )
  },[taskid])

  return (
    <>
    {deleteSuccess !== null ?
      <div aria-label='success-message' className='message-success'>{deleteSuccess} <Link to={'/tasks'}>Volver a la lista</Link></div>
      :
    <BlockContainer>
      <Modal
        title="Eliminar tarea"
        isOpened={isOpened}
        onClose={closeModal}
        content="Esta acción es irreversible. ¿Desea continuar?"
        type="confirm"
        action={handleDelete} />
      {loading ? <Spinner /> : ''}
      <BlockHeaderComponent
        title='Detalle de tarea'
        actions={actions}
      />
        {error !== null ?
          <ErrorMessage>{error.message}</ErrorMessage>
          :
          (task && task.task)?
            <TaskDetailContainer>
              <TaskDetailItem>
                <TaskDetailKey>Título:</TaskDetailKey>
                <TaskDetailValue>{task.task.title}</TaskDetailValue>
              </TaskDetailItem>
              <TaskDetailItem>
                <TaskDetailKey>Descripción:</TaskDetailKey>
                <TaskDetailValue>{task.task.description}</TaskDetailValue>
              </TaskDetailItem>
              <TaskDetailItem>
                <TaskDetailKey>Author:</TaskDetailKey>
                <TaskDetailValue>{task.task.author}</TaskDetailValue>
              </TaskDetailItem>
              <TaskDetailItem>
                <TaskDetailKey>Estado:</TaskDetailKey>
                <TaskDetailValue>{statusLabel}</TaskDetailValue>
              </TaskDetailItem>
              <TaskDetailItem>
                <TaskDetailKey>Prioridad:</TaskDetailKey>
                <TaskDetailValue>{priorityLabel}</TaskDetailValue>
              </TaskDetailItem>
              <TaskDetailItem>
                <TaskDetailKey>Creada:</TaskDetailKey>
                <TaskDetailValue>{task.task.createdDate ? dateToFormattedDate(new Date(task.task.createdDate)) : '-'}</TaskDetailValue>
              </TaskDetailItem>
              <TaskDetailItem>
                <TaskDetailKey>Fecha límite:</TaskDetailKey>
                <TaskDetailValue>{task.task.limitDate ? dateToFormattedDate(new Date(task.task.limitDate)) : '-'}</TaskDetailValue>
              </TaskDetailItem>
              <TaskDetailItem>
                <TaskDetailKey>Tags:</TaskDetailKey>
                <TaskDetailValue>
                {task.task.tags.length ?
                  <TaskTagsContainer>
                  {
                    task.task.tags.map((tag) => {
                      return <div key={tag}>{tag}</div>
                    })
                  }
                  </TaskTagsContainer>
                  :
                  '-'
                }
                </TaskDetailValue>
              </TaskDetailItem>
              <TaskDetailItem>
                <TaskDetailKey>Tarea padre:</TaskDetailKey>
                <TaskDetailValue>
                  {task.parentTask ?
                    <TaskChildrenContainer>
                      <Link to={`${task.parentTask.id}`}>{task.parentTask.title}</Link>
                    </TaskChildrenContainer>
                    :
                    '-'
                  }
                </TaskDetailValue>
              </TaskDetailItem>
              <TaskDetailItem>
                <TaskDetailKey>Subtareas:</TaskDetailKey>
                <TaskDetailValue>
                {task.childTasks.length ?
                  <TaskChildrenContainer>
                  {
                    task.childTasks.map((child) => {
                      return <Link to={`${child.id}`} key={child.title}>{child.title}</Link>
                    })
                  }
                  </TaskChildrenContainer>
                  :
                  '-'
                }
                </TaskDetailValue>
              </TaskDetailItem>
              <TaskDetailItem>
                <TaskDetailKey>Estadísticas:</TaskDetailKey>
                <TaskDetailValue>
                  <StatsTotalSpentTimeComponent title="Tiempo total" task={task.task} />
                </TaskDetailValue>
              </TaskDetailItem>
              <TaskDetailItem>
                <TaskDetailKey>Resumen agrupado:</TaskDetailKey>
                <TaskDetailValue>
                  {groupedData &&
                    <GroupedNode node={groupedData}/>
                  }
                </TaskDetailValue>
              </TaskDetailItem>
            </TaskDetailContainer>
          :
            <div></div>
        }
    </BlockContainer>
    }
    </>
  )
}