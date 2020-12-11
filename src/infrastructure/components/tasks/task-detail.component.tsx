import React from 'react'
import styled from 'styled-components'
import { color } from '../../../styles/theme'
import { useParams} from 'react-router-dom'
import { ApiResponse } from '../../../api/domain/api-response'
import { TaskDetail, TaskObject } from '../../../domain/task-detail'
import { TaskListComponent } from './task-list.component'
import { TaskPriority, TaskStatus, ConstObjectToSelectOptionsArray } from '../../../domain/task-definitions'
import { getTask } from '../../../application/getTask'
import { deleteTask } from '../../../application/deleteTask'
import { Spinner } from '../common/spinner'
import { BlockActions } from '../common/block-actions'
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa'
import { Modal } from '../common/modal'
import { Link } from 'react-router-dom'
import { dateToString } from '../../../lib/date.utils'
 
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

`
export const TaskChildren = (props: {childTasks: Array<TaskDetail>, handler: any}) => {
    return (
        <TaskChildrenContainer>
            {}
        </TaskChildrenContainer>
    )
}

export interface TaskProps {
    taskid: string,
}
export const TaskDetailComponent = (props) => {
    let { taskid } = useParams<TaskProps>()
    const [ taskId, setTaskId ] = React.useState<string>(props.task || taskid)
    const [task, setTask] = React.useState<TaskObject | null>(null)        
    const [error, setError] = React.useState<Error | null>(null)
    const [deleteSuccess, setDeleteSuccess] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [actions, setActions] = React.useState<Array<any>>([])
    const [isOpened, setOpened] = React.useState(false)
    const [statusLabel, setStatusLabel ] = React.useState<string>('')
    const [priorityLabel, setPriorityLabel ] = React.useState<string>('')
    const [confirmedDelete, setConfirmedDelete ] = React.useState<boolean>(false)
    
    const confirmDelete = () =>{
        openModal()        
    }
    const handleDelete = () => {
        setOpened(false)
        setLoading(true)
        setConfirmedDelete(true)   
    }

    React.useEffect(() => {
        let cancelled = false
        if(confirmedDelete){
            deleteTask(taskid)
            .then(
                result => {
                    if(!cancelled){
                        if(!result.hasError){
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

        return () => cancelled = true;
    },[confirmedDelete])

    const closeModal = () => {  setOpened(false)}
    const openModal = () => { setOpened(true)}

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
            handler: confirmDelete
        },
        {
            icon: FaPlus,
            text: 'Subtarea',
            route: `/tasks/new/${taskid}`,
            type: 'link'
        }
    ]

    React.useEffect(() => {
        let cancelled = false;
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
                            console.log(result)
                            let status = ConstObjectToSelectOptionsArray(TaskStatus).filter(i => i.value === result.data.task.status)
                            setStatusLabel(status.length ? status[0].label : '')
                            let priority = ConstObjectToSelectOptionsArray(TaskPriority).filter(i => i.value === result.data.task.priority)
                            setPriorityLabel(priority.length ? priority[0].label : '')
                            console.log(statusLabel,priorityLabel)
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
        
            return () => cancelled = true
    },[taskId])
    return (        
        <div className="block">
            <Modal 
                title="Eliminar tarea" 
                isOpened={isOpened} 
                onClose={closeModal}
                content="Esta acción es irreversible. ¿Desea continuar?"
                type="confirm"
                action={handleDelete} />
            {loading ? <Spinner /> : ''}
            <h3 className="section-title">Detalle de tarea</h3>
            {deleteSuccess !== null ? 
                <div aria-label='success-message' className='message-success'>{deleteSuccess} <Link to={'/tasks'}>Volver a la lista</Link></div>
                :
                <>
                <BlockActions 
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
                                <TaskDetailValue>{task.task.createdDate ? dateToString(new Date(task.task.createdDate)) : '-'}</TaskDetailValue>
                            </TaskDetailItem>
                            <TaskDetailItem>
                                <TaskDetailKey>Fecha límite:</TaskDetailKey>
                                <TaskDetailValue>{task.task.limitDate ? dateToString(new Date(task.task.limitDate)) : '-'}</TaskDetailValue>
                            </TaskDetailItem>
                            <TaskDetailItem>
                                <TaskDetailKey>Tarea padre:</TaskDetailKey>
                                <TaskDetailValue>
                                    {task.parentTask ?
                                        <Link to={`tasks/${task.parentTask.id}`}>{task.parentTask.title}</Link>
                                        :
                                        '-'
                                    }
                                </TaskDetailValue>
                            </TaskDetailItem>
                            <TaskDetailItem>
                                <TaskDetailKey>Tags:</TaskDetailKey>
                                <TaskDetailValue>{task.task.tags}</TaskDetailValue>
                            </TaskDetailItem>
                            <TaskChildren children={task.childTasks} handler={childHandler}/>
                        </TaskDetailContainer>
                        
                    :   
                        <div></div>
                }
                </>
            }    
                
        </div>
    )   
}