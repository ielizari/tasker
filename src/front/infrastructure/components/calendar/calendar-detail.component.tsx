import React from 'react'
import styled from 'styled-components'
import { color } from '../../../styles/theme'
import { useParams} from 'react-router-dom'
import { Calendar, CalendarNonWorkingTypes } from '../../../domain/calendar'
import { getCalendar } from '../../../application/getCalendar'
import { deleteCalendar } from '../../../application/deleteCalendar'
import { Spinner } from '../common/spinner'
import { FaEdit, FaTrashAlt } from 'react-icons/fa'
import { Modal } from '../common/modal'
import { Link } from 'react-router-dom'
import { formatElapsedTime, ISOStringToFormatedDate, getDaysDifferenceBetweenDates } from '../../../../lib/date.utils'
import { BlockContainer, BlockHeaderComponent } from '../common/block'
import { SyncStateContext} from '../../../application/contexts/dbSyncContext'
import { CalendarView } from './calendar-view'

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
  thead {
    td {
      font-weight: bold;
    }
  }
  tr {
    border-style: solid;
    border-width: 1px 0;
    border-color: ${color.lightGrey};

    &:nth-child(even) {
      background-color: ${color.lightGrey};
    }
  }
  td {
    padding: 0.3rem 1rem;
    text-align: center;
  }
`
const WeekHoursContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin: 1rem;
`

const WeekHoursTitle = styled.div`
  font-weight: bold;
  color: ${color.black};
  padding: 0.5rem 0;
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
  const [ totalTime, setTotalTime] = React.useState<string>(null)
  const [ currentTime, setCurrentTime] = React.useState<string>(null)
  const [ workTime, setWorkTime] = React.useState<string>(null)
  const [ takenEligibleHolidays, setTakenEligibleHolidays] = React.useState<number>(0)

  const handleDelete = () => {
    setOpened(false)
    setLoading(true)
    setConfirmedDelete(true)
  }

  React.useEffect(() => {
    if (calendar) {
      const takenEligibleHolidays = calendar.workHours?.reduce((total, item) => {
        return total += item.nonWorking ===  CalendarNonWorkingTypes.ELIGIBLE_HOLIDAY ?
          getDaysDifferenceBetweenDates(new Date(item.startDate), new Date(item.endDate)) + 1
          : 0
      }, 0)
      setTakenEligibleHolidays(takenEligibleHolidays)
      setTotalTime(formatElapsedTime(calendar.status.expectedTotalTime))
      setCurrentTime(formatElapsedTime(calendar.status.currentExpectedTime))
      const workedTime = formatElapsedTime(calendar.status.workedTime)
      const workDiff = calendar.status.currentExpectedTime - calendar.status.workedTime
      const formattedWorkDiff = formatElapsedTime(workDiff)
      setWorkTime(`${workedTime} (${formattedWorkDiff})`)
    } else {
      setTotalTime('-')
      setCurrentTime('-')
      setWorkTime('-')
    }
  }, [calendar])

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
                <DetailKey>Vacaciones elegibles:</DetailKey>
                <DetailValue>{calendar.eligibleHolidays} ({takenEligibleHolidays} disfrutadas)</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailKey>Tiempo total:</DetailKey>
                <DetailValue>{totalTime}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailKey>Tiempo hasta hoy:</DetailKey>
                <DetailValue>{currentTime}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailKey>Tiempo trabajado:</DetailKey>
                <DetailValue>{workTime}</DetailValue>
              </DetailItem>
              <CalendarView calendar={calendar}/>
              <WeekHoursContainer>
                <WeekHoursTitle>Horarios:</WeekHoursTitle>
                <DetailTable>
                  <thead>
                    <tr>
                      <td>Título</td>
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
                          <td>{week.title || ''}</td>
                          <td>{ISOStringToFormatedDate(week.startDate, 'date')}</td>
                          <td>{ISOStringToFormatedDate(week.endDate, 'date')}</td>
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
              </WeekHoursContainer>
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