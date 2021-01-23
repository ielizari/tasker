import React from 'react'
import styled from 'styled-components'
import { color, common } from '../../../styles/theme'
import { useParams} from 'react-router-dom'
import { WorklogObject } from '../../../domain/worklog'
import { getWorklog } from '../../../application/getWorklog'
import { deleteWorklog } from '../../../application/deleteWorklog'
import { Spinner } from '../common/spinner'
import { BlockActions } from '../common/block-actions'
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa'
import { Modal } from '../common/modal'
import { Link } from 'react-router-dom'
import { BlockContainer, BlockHeaderComponent } from '../common/block'
import { WorklogSequence } from './worklog-sequence.component'
import { WorklogGrouped } from './worklog-grouped.component'
import { SyncStateContext} from '../../../application/contexts/dbSyncContext'
import { elapsedTime, formatElapsedTime } from '../../../../lib/date.utils'

const WorklogDetailContainer = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
`
const WorklogDetailKey = styled.div`
    font-weight: bold;
    color: ${color.black};
    flex-basis: 10rem;
`
const WorklogDetailValue = styled.div`
    color: ${color.black};
    white-space: nowrap;
`

const WorklogGroupedContainer = styled.div`
    width: 50%;
    padding: 0 1rem;
`
const WorklogGroupedTitle = styled.div`
    padding: 0.5rem 0;
    font-weight: bold;
    color: #000;
    font-size: 1.2rem;
`
const WorklogDetailGrouped = styled(WorklogGrouped)`
`

const WorklogDetailFields = styled.ul`
    width: 50%;
`
const WorklogDetailItem = styled.li`
    display: flex;
    flex-direction: vertical;
    margin: 1rem;
`

const ErrorMessage = styled.div`
    background-color: ${color.lightRed};
    padding: 1rem;
    text-align: center;
    color: ${color.white};
    margin: 0.5rem;
`

const WorklogTagsContainer = styled.div`
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

export interface WorklogProps {
    worklogid: string,
}
export const WorklogDetailComponent = (props) => {
    let { worklogid } = useParams<WorklogProps>()
    const syncCtx = React.useContext(SyncStateContext)
    const {setSync} = syncCtx

    const [worklog, setWorklog] = React.useState<WorklogObject | null>(null)        
    const [error, setError] = React.useState<Error | null>(null)
    const [deleteSuccess, setDeleteSuccess] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [actions, setActions] = React.useState<Array<any>>([])
    const [isOpened, setOpened] = React.useState(false)
    const [confirmedDelete, setConfirmedDelete ] = React.useState<boolean>(false)
    
    const handleDelete = () => {
        setOpened(false)
        setLoading(true)
        setConfirmedDelete(true)   
    }

    
    const changeHandler = (worklog: WorklogObject) => {
        setWorklog(worklog)
    }

    React.useEffect(() => {
        let cancelled = false
        if(confirmedDelete){
            deleteWorklog(worklogid)
            .then(
                result => {
                    if(!cancelled){
                        if(!result.hasError){
                            setSync({sync: false})
                            setDeleteSuccess('El parte se ha eliminado con éxito')
                        }else{
                            setError(new Error('Ha ocurrido un error al eliminar el parte.'))
                        }
                        setLoading(false)
                    }
                },
                error => {
                    console.log("Error: ", error)
                    setError(new Error('Ha ocurrido un error al eliminar el parte.'))
                    setLoading(false)
                }
            )
        }

        return () => cancelled = true;
    },[confirmedDelete,worklogid,setSync])

    const closeModal = () => {  setOpened(false)}
    const openModal = () => { setOpened(true)}    

    React.useEffect(() => {
        let cancelled = false;
        let actionItems = [
            {
                icon: FaEdit,
                text: 'Editar',
                route: `/worklogs/edit/${worklogid}`,
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
                text: 'Añadir trabajo',
                route: `/worklog/new/${worklogid}`,
                type: 'link'
            }
        ]
        setActions(actionItems)
        setLoading(true)
        getWorklog(worklogid)
            .then(
                (result) => {
                    if(!cancelled){
                        if(result.hasError){
                            setError(new Error(result.error))
                            setWorklog(null)
                        }else{
                            setWorklog(result.data) 
                            setError(null)
                        }
                        
                        setLoading(false)  
                    }
                },
                (error) => {
                    if(!cancelled){
                        setError(error)
                        setWorklog(null)
                        setLoading(false)
                    }
                }
            )
        
            return () => cancelled = true
    },[worklogid])

    React.useEffect(() => {
        console.log("WL Detail",worklog)
    },[worklog])
    
    return (        
        <BlockContainer>
            <Modal 
                title="Eliminar tarea" 
                isOpened={isOpened} 
                onClose={closeModal}
                content="Esta acción es irreversible. ¿Desea continuar?"
                type="confirm"
                action={handleDelete} />            
            {loading ? <Spinner /> : ''}
            {deleteSuccess !== null ? 
                <div aria-label='success-message' className='message-success'>{deleteSuccess} <Link to={'/worklogs'}>Volver a la lista</Link></div>
                :
                <>
                <BlockHeaderComponent 
                    title='Detalle de parte'
                    actions={actions}
                />
                {error !== null ?
                    <ErrorMessage>{error.message}</ErrorMessage>
                    :
                    (worklog && worklog.worklog)?
                    <>             
                        <WorklogDetailContainer> 
                            <WorklogDetailFields>
                                <WorklogDetailItem>
                                    <WorklogDetailKey>Título:</WorklogDetailKey>
                                    <WorklogDetailValue>{worklog.worklog.title}</WorklogDetailValue>
                                </WorklogDetailItem>      
                                <WorklogDetailItem>
                                    <WorklogDetailKey>Creada:</WorklogDetailKey>
                                    <WorklogDetailValue>{worklog.worklog.createdDate ? worklog.worklog.createdDate : '-'}</WorklogDetailValue>
                                </WorklogDetailItem>
                                <WorklogDetailItem>
                                    <WorklogDetailKey>Inicio:</WorklogDetailKey>
                                    <WorklogDetailValue>{worklog.worklog.startDatetime ? worklog.worklog.startDatetime : '-'}</WorklogDetailValue>
                                </WorklogDetailItem>
                                <WorklogDetailItem>
                                    <WorklogDetailKey>Fin:</WorklogDetailKey>
                                    <WorklogDetailValue>{worklog.worklog.endDatetime ? worklog.worklog.endDatetime : '-'}</WorklogDetailValue>
                                </WorklogDetailItem>
                                <WorklogDetailItem>
                                    <WorklogDetailKey>Duración:</WorklogDetailKey>
                                    <WorklogDetailValue>
                                        {worklog.worklog.endDatetime ? 
                                            formatElapsedTime(
                                                elapsedTime( 
                                                    worklog.worklog.startDatetime, 
                                                    worklog.worklog.endDatetime
                                                )) 
                                            : 
                                            '-'
                                            }
                                    </WorklogDetailValue>
                                </WorklogDetailItem>   
                                <WorklogDetailItem>
                                    <WorklogDetailKey>Tags:</WorklogDetailKey>
                                    <WorklogDetailValue>
                                    {worklog.worklog.tags.length ?
                                        <WorklogTagsContainer>
                                        {
                                            worklog.worklog.tags.map((tag) => {
                                                return <div key={tag}>{tag}</div>
                                            })
                                        }
                                        </WorklogTagsContainer> 
                                        :
                                        '-'
                                    }               
                                    </WorklogDetailValue>
                                </WorklogDetailItem>
                            </WorklogDetailFields>

                            <WorklogGroupedContainer>
                                <WorklogGroupedTitle>Resumen agrupado</WorklogGroupedTitle>
                                <WorklogDetailGrouped worklog={worklog} />
                            </WorklogGroupedContainer>
                        </WorklogDetailContainer>       

                        {worklog &&                            
                            <WorklogSequence worklog={worklog} worklogChangeHandler={changeHandler}/>                            
                        }                      
                    </>
                        
                    :   
                        <div></div>
                }
                </>
            }    
                
        </BlockContainer>
    )   
}