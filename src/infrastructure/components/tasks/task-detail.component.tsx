import React from 'react'
import styled from 'styled-components'
import { color } from '../../../styles/theme'
import { useParams} from 'react-router-dom'
import { TaskDetail } from '../../../domain/task-detail'

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

export interface TaskProps {
    taskid: string,
}
export const TaskDetailComponent = () => {
    let { taskid } = useParams<TaskProps>()
    const [task, setTask] = React.useState<TaskDetail | null>(null)
    const [error, setError] = React.useState<Error | null>(null)

    React.useEffect(() => {
        fetch(`http://localhost:3000/api/tasks/${taskid}`)
            .then(res => res.json())
            .then(
                (result) => {
                    if(result.errMessage){
                        setError(new Error(result.errMessage))
                    }else{
                        setTask(result); 
                    }                   
                },
                (error) => {
                    setError(new Error('Ocurrió un error'))
                }
            )
            
    },[])
    return (
        <div className="block">
            <h3 className="section-title">Detalle de tarea</h3>
            {error !== null?
                <ErrorMessage>{error.message}</ErrorMessage>
                :
                (task !== null)?                
                    <TaskDetailContainer> 
                        <TaskDetailItem>
                            <TaskDetailKey>Título:</TaskDetailKey>
                            <TaskDetailValue>{task.title}</TaskDetailValue>
                        </TaskDetailItem>
                        <TaskDetailItem>
                            <TaskDetailKey>Descripción:</TaskDetailKey>
                            <TaskDetailValue>{task.description}</TaskDetailValue>
                        </TaskDetailItem>
                        <TaskDetailItem>
                            <TaskDetailKey>Author:</TaskDetailKey>
                            <TaskDetailValue>{task.author}</TaskDetailValue>
                        </TaskDetailItem>
                        <TaskDetailItem>
                            <TaskDetailKey>Estado:</TaskDetailKey>
                            <TaskDetailValue>{task.status}</TaskDetailValue>
                        </TaskDetailItem>
                        <TaskDetailItem>
                            <TaskDetailKey>Prioridad:</TaskDetailKey>
                            <TaskDetailValue>{task.priority}</TaskDetailValue>
                        </TaskDetailItem>
                        <TaskDetailItem>
                            <TaskDetailKey>Tags:</TaskDetailKey>
                            <TaskDetailValue>{task.tags}</TaskDetailValue>
                        </TaskDetailItem>
                    </TaskDetailContainer>
                :   
                    <div>mierdaz</div>
            }     
        </div>
    )   
}