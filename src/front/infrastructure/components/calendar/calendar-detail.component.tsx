import React from 'react'
import styled from 'styled-components'
import { color, common } from '../../../styles/theme'
import { useParams} from 'react-router-dom'
import { Calendar } from '../../../domain/calendar'
import { getCalendar } from '../../../application/getCalendar'
import { deleteCalendar } from '../../../application/deleteCalendar'
import { Spinner } from '../common/spinner'
import { FaEdit, FaTrashAlt, FaPlus } from 'react-icons/fa'
import { Modal } from '../common/modal'
import { Link } from 'react-router-dom'
import { dateToFormattedDate } from '../../../../lib/date.utils'
import { BlockContainer, BlockHeaderComponent } from '../common/block'
import { SyncStateContext} from '../../../application/contexts/dbSyncContext'

const DetailContainer = styled.ul`
`;
const DetailKey = styled.div`
  font-weight: bold;
  color: ${color.black};
  flex-basis: 10rem;
`;
const DetailValue = styled.div`
  color: ${color.black}
`;

const DetailItem = styled.li`
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

const DetailTable = styled.table`
  td {
    padding: 0 1rem;
    text-align: center;
  }
`

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

export interface CalendarProps {
  calendarid: string,
}
export const CalendarDetailComponent = (props) => {
  let { calendarid } = useParams<CalendarProps>()
  const syncCtx = React.useContext(SyncStateContext)
  const {setSync} = syncCtx

  const [calendar, setCalendar] = React.useState<Calendar | null>(null)
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

  React.useEffect(() : void => {
    let cancelled = false
    if(confirmedDelete){
      deleteCalendar(calendarid)
      .then(
        result => {
          if(!cancelled){
            if(!result.hasError){
              setSync({sync: false})
              setDeleteSuccess('El calendario se ha eliminado con éxito')
            }else{
              setError(new Error('Ha ocurrido un error al eliminar el calendario.'))
            }
            setLoading(false)
          }
        },
        error => {
          console.log("Error: ", error)
          setError(new Error('Ha ocurrido un error al eliminar el calendario.'))
          setLoading(false)
        }
      )
    }
  },[confirmedDelete,calendarid,setSync])

  const closeModal = () => {  setOpened(false)}
  const openModal = () => { setOpened(true)}

  React.useEffect((): void => {
    let cancelled = false;
    let actionItems = [
      {
        icon: FaEdit,
        text: 'Editar',
        route: `/calendars/edit/${calendarid}`,
        type: 'link'
      },
      {
        icon: FaTrashAlt,
        text: 'Borrar',
        type: 'button',
        handler: openModal
      },
    ]
    setActions(actionItems)
    setLoading(true)
    getCalendar(calendarid)
      .then(
        (result) => {
          if(!cancelled){
            if(result.hasError){
              setError(new Error(result.error))
              setCalendar(null)
            }else{
              setCalendar(result.data)
              setError(null)
            }

            setLoading(false)
          }
        },
        (error) => {
          if(!cancelled){
            setError(error)
            setCalendar(null)
            setLoading(false)
          }
        }
      )
  },[calendarid])

  return (
    <>
    {deleteSuccess !== null ?
      <div aria-label='success-message' className='message-success'>{deleteSuccess} <Link to={'/calendars'}>Volver a la lista</Link></div>
      :
    <BlockContainer>
      <Modal
        title="Eliminar calendario"
        isOpened={isOpened}
        onClose={closeModal}
        content="Esta acción es irreversible. ¿Desea continuar?"
        type="confirm"
        action={handleDelete} />
      {loading ? <Spinner /> : ''}
      <BlockHeaderComponent
        title='Detalle de calendario'
        actions={actions}
      />
        {error !== null ?
          <ErrorMessage>{error.message}</ErrorMessage>
          :
          (calendar ?
            <DetailContainer>
              <DetailItem>
                <DetailKey>Título:</DetailKey>
                <DetailValue>{calendar.title}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailKey>Estado:</DetailKey>
                <DetailValue>{calendar.enabled ? 'Activo' : 'Inactivo'}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailKey>Horas totales:</DetailKey>
                <DetailValue>{calendar.status.expectedTotalTime / 3600}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailKey>Horas actuales:</DetailKey>
                <DetailValue>{calendar.status.currentExpectedTime / 3600}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailKey>Horas trabajadas:</DetailKey>
                <DetailValue>{calendar.status.workedTime / 3600} ({(calendar.status.currentExpectedTime - calendar.status.workedTime) /3600})</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailKey>Horarios:</DetailKey>
                <DetailValue>
                  <DetailTable>
                    <thead>
                      <tr>
                        <td>Inicio</td>
                        <td>Fin</td>
                        <td>Lunes</td>
                        <td>Martes</td>
                        <td>Miércoles</td>
                        <td>Jueves</td>
                        <td>Viernes</td>
                        <td>Sábado</td>
                        <td>Domingo</td>
                      </tr>
                    </thead>
                    <tbody>
                      { calendar.workHours.map((week, index) => (
                          <tr key={`week_${index}`}>
                            <td>{week.startDate}</td>
                            <td>{week.endDate}</td>
                            <td>{week.monday}</td>
                            <td>{week.tuesday}</td>
                            <td>{week.wednesday}</td>
                            <td>{week.thursday}</td>
                            <td>{week.friday}</td>
                            <td>{week.saturday}</td>
                            <td>{week.sunday}</td>
                          </tr>
                        ))
                      }
                    </tbody>
                  </DetailTable>
                </DetailValue>
              </DetailItem>
            </DetailContainer>
          :
            <div></div>
          )
        }
    </BlockContainer>
    }
    </>
  )
}