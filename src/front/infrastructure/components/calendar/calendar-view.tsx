import React from 'react'
import styled from 'styled-components'
import { color, font } from 'src/front/styles/theme'
import { Calendar } from 'src/front/domain/calendar'
import { getCalendarJobsByDay } from 'src/front/application/getCalendarJobsByDay'
import { CalendarDayJobs, CalendarNonWorkingTypes, CalendarWeek } from 'src/api/domain/calendar'
import { Job } from 'src/front/domain/job'
import { elapsedTime, formatElapsedTime, formatElapsedTimeFromSeconds, ISOStringToFormatedDate } from 'src/lib/date.utils'
import { ModalWithComponent } from '../common/modal'
import { range } from 'lodash'
import { time } from 'console'

const CalendarHeader = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  margin: 1rem;
`

const CalendarLegend = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1.5rem;
`
const CalendarSelectionButton = styled.button`
  border: 1px solid black;
  padding: 0.5rem;
`

const CalendarContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 1rem;
  justify-content: space-between;
  margin: 1rem;
`

const CalendarLegendItem = styled.div<{
  bgcolor?: string
}>`
  border: 1px solid black;
  padding: 0.3rem;
  background-color: ${props => props.bgcolor || '#fff'};
  align-content: center;
`
const DayColors  = {
  NORMAL: color.calendarDayNormal,
  HOLIDAY: color.calendarDayHoliday,
  ELIGIBLE_HOLIDAY: color.calendarDayEligibleHoliday,
  SICK_DAY: color.calendarDaySick,
  NO_HOURS: color.calendarDayNoHours,
  UNKNOWN: color.calendarDayUnknown,
  SELECTED: color.calendarDaySelected,
}
const DayItem = styled.td<{
  disabled?: boolean
  bgcolor?: string
}>`
  background-color: ${props => props.bgcolor || '#fff'};
  cursor: pointer;
  text-align: center;
  vertical-align: middle;
  border: 2px solid transparent;
  &:hover {
    background-color: cyan;
    border: 2px solid red;
  }
`

type CalendarSelection = {
  start: DayObject,
  end: DayObject,
}
export const CalendarView = (props: { calendar: Calendar}) => {
  const [ days, setDays ] = React.useState<Array<CalendarDayJobs>>([])
  const [ isSelectionOpen, setSelectionOpen ] = React.useState<boolean>(false)
  const [ selectedDays, setSelectedDays ] = React.useState<CalendarSelection>({
    start: undefined,
    end: undefined
  })

  const closeModal = () => {  setSelectionOpen(false)}
  const openModal = () => { setSelectionOpen(true)}

  const selectionHandler = (day: DayObject) => {
    const selected = {...selectedDays}
    if (!selectedDays.start) {
      selected.start = day
    } else if (selectedDays.start.date === day.date) {
      if (selectedDays.end?.date) {
        selected.start = selectedDays.end
        selected.end = undefined
      } else {
        selected.start = undefined
      }
    } else if(!selectedDays.end) {
      if (day.date < selectedDays.start.date) {
        selected.end = selectedDays.start
        selected.start = day
      } else {
        selected.end = day
      }
    } else if (selectedDays.end.date === day.date) {
      selected.end = undefined
    } else if (day.date < selectedDays.start.date) {
      selected.start = day
    } else if (day.date > selectedDays.start.date) {
      selected.end = day
    }
    setSelectedDays(selected)
  }

  React.useEffect(() => {
    getCalendarJobsByDay(props.calendar.id)
      .then(
        (result) => {
          setDays(result.data)
        },
        (error) => {
          console.error(error)
        }
      )
  }, [props.calendar])
  return (
    <>
      <CalendarHeader>
        <CalendarLegend>
          <CalendarLegendItem bgcolor={DayColors.NORMAL}>Normal</CalendarLegendItem>
          <CalendarLegendItem bgcolor={DayColors.HOLIDAY}>Vacaciones obligatorias</CalendarLegendItem>
          <CalendarLegendItem bgcolor={DayColors.ELIGIBLE_HOLIDAY}>Vacaciones elegibles</CalendarLegendItem>
          <CalendarLegendItem bgcolor={DayColors.NO_HOURS}>Sin horas</CalendarLegendItem>
        </CalendarLegend>
        {selectedDays.start && (
          <CalendarSelectionButton
            onClick={openModal}
          >
            Mostrar selección
          </CalendarSelectionButton>
        )}
      </CalendarHeader>
      <YearView
        days={days}
        selectedDays={selectedDays}
        selectionHandler={selectionHandler}
      />
      <ModalWithComponent
        isOpened={isSelectionOpen}
        onClose={closeModal}
        Component={SelectionDetail}
        resultHandler={() => {}}
        selectedDays={selectedDays}
        days={days}
        calendar={props.calendar}
      />
    </>
    )
}

interface MonthsObject {
  [key: string] : Array<DayObject>
}
interface DayObject {
  date: string,
  jobs: Array<Job>,
  schedule: CalendarWeek,
}

export const YearView = (props: {
  days: Array<CalendarDayJobs>,
  selectedDays: CalendarSelection,
  selectionHandler: Function
}) => {
  const [ months, setMonths ] = React.useState<MonthsObject>({})
  React.useEffect(() => {
    const groupedMonths = {}
    props.days.forEach((day) => {
      const date = new Date(day.date)
      const monthLabel = `${date.getFullYear()}-${date.getMonth()+1}`
      if(!groupedMonths[monthLabel]){
        groupedMonths[monthLabel] = []
      }
      groupedMonths[monthLabel].push(day)
    })
    setMonths(groupedMonths)
  }, [props.days])
  return (
    <CalendarContainer>
      {Object.keys(months) && Object.entries(months).map(([label, days]) => (
        <MonthView
          key={label}
          label={label}
          days={days}
          selectedDays={props.selectedDays}
          selectionHandler={props.selectionHandler}
        />
      ))}
    </CalendarContainer>
  )
}

const MonthContainer = styled.table`
  border: 1px solid black;
  border-collapse: separate;
  tbody tr:first-child td {
    font-weight: bold;
  }
  td {
    padding: 0.3rem;
  }
`
const MonthTitle = styled.th`
  text-align: center;
  font-weight: bold;
  background-color: #e0bc09;
`

const getEmptyWeek = () => {
  const week = []
  for (let i=0; i<7; i++) {
    week.push({jobs: []})
  }
  return week
}

const getDayHours = (scheduling: CalendarWeek, weekday: number): number => {
  if (weekday === 0) return scheduling.sunday
  if (weekday === 1) return scheduling.monday
  if (weekday === 2) return scheduling.tuesday
  if (weekday === 3) return scheduling.wednesday
  if (weekday === 4) return scheduling.thursday
  if (weekday === 5) return scheduling.friday
  if (weekday === 6) return scheduling.saturday
  return 0
}
export const MonthView = (props: {
  label: string,
  days: Array<DayObject>,
  selectedDays: CalendarSelection,
  selectionHandler: Function
}) => {
  const [ weeks, setWeeks ] = React.useState<Array<Array<DayObject>>>([getEmptyWeek()])
  const [ expectedTime, setExpectedTime ] = React.useState<number>(0)
  const [ workedTime, setWorkedTime ] = React.useState<number>(0)
  const [ diffTime, setDiffTime ] = React.useState<number>(0)

  React.useEffect(() => {
    const weeks = []
    const [ year, month ] = props.label.split('-')
    const currentMonth = new Date(Number(year), Number(month)-1, 1)
    let monthExpectedTime = 0
    let monthWorkedTime = 0

    for(const day of props.days) {
      const dayIdx = currentMonth.getDay() === 0 ? 6 : currentMonth.getDay() - 1
      if (dayIdx === 0 || !weeks.length) {
        weeks.push(getEmptyWeek())
      }

      if (day.schedule && !day.schedule.nonWorking) {
        monthExpectedTime += getDayHours(day.schedule, currentMonth.getDay())
      }
      monthWorkedTime += day.jobs?.reduce((time, job) => {
        const start = new Date(job.startDatetime)
        const end = job.endDatetime ? new Date(job.endDatetime) : new Date()
        const diff = end.getTime() - start.getTime()
        return time += diff
      }, 0) || 0

      weeks[weeks.length-1][dayIdx] = day
      currentMonth.setDate(currentMonth.getDate() + 1)
    }
    setExpectedTime(monthExpectedTime * 3600000)
    setWorkedTime(monthWorkedTime)
    setDiffTime(monthWorkedTime - (monthExpectedTime*3600000))
    setWeeks(weeks)
  }, [props.label, props.days])
  return (
    <MonthContainer>
      <thead>
        <tr>
          <MonthTitle colSpan={7}>{props.label}</MonthTitle>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Lu</td>
          <td>Ma</td>
          <td>Mi</td>
          <td>Ju</td>
          <td>Vi</td>
          <td>Sa</td>
          <td>Do</td>
        </tr>
        {weeks.map((week, index) => (
          <WeekView
            key={`week_${index}`}
            week={week}
            selectedDays={props.selectedDays}
            selectionHandler={props.selectionHandler}
          />
        ))}
        <tr>
          <td colSpan={7}>
            <div>Resumen</div>
            <div>Esperado: {formatElapsedTime(expectedTime)}</div>
            <div>Trabajado: {formatElapsedTime(workedTime)}</div>
            <div>Diferencia: {formatElapsedTime(diffTime)}</div>
          </td>
        </tr>
      </tbody>
    </MonthContainer>
  )
}

const getDayColor = (day: DayObject, selected: boolean) => {
  if(selected) return DayColors.SELECTED
  if(!day.schedule) return DayColors.NORMAL
  if(day.schedule.nonWorking === CalendarNonWorkingTypes.ELIGIBLE_HOLIDAY) return DayColors.ELIGIBLE_HOLIDAY;
  if(day.schedule.nonWorking === CalendarNonWorkingTypes.HOLIDAY) return DayColors.HOLIDAY;
  if(day.schedule.nonWorking === CalendarNonWorkingTypes.SICK_DAY) return DayColors.SICK_DAY;
  const currentDay = new Date(day.date)
  const dayHours = getDayHours(day.schedule,  currentDay.getDay())
  if (dayHours === 0) return DayColors.NO_HOURS
  return DayColors.NORMAL;
}
export const WeekView = (props: {
  week: Array<DayObject>,
  selectedDays: CalendarSelection,
  selectionHandler: Function
}) => {
  return (
    <tr>
      {props.week.map((day, index) => {
        return (
          <DayView
            key={`day_${index}`}
            day={day}
            selectedDays={props.selectedDays}
            selectionHandler={props.selectionHandler}
          />
        )}
      )}
    </tr>
  )
}

export const DayView = (props: {
  day: DayObject,
  selectedDays: CalendarSelection,
  selectionHandler: Function
}) => {
  //const [ isSelected, setSelected ] = React.useState<boolean>(false)
  const handleSelect = (day) => {
    if (!day.date) return;
    //setSelected(!isSelected)
    props.selectionHandler(day)
  }

  const isSelected = React.useMemo(() => {
    if(!props.selectedDays.start) return false
    return props.selectedDays.end ?
      props.day.date >= props.selectedDays.start.date && props.day.date <= props.selectedDays.end.date :
      props.day.date === props.selectedDays.start.date
  }, [props.day, props.selectedDays])

  return (
    <DayItem
      disabled={!props.day.date}
      bgcolor={getDayColor(props.day, isSelected)}
      onClick={() => handleSelect(props.day)}
    >
      <div>{props.day.date ? new Date(props.day.date).getDate() : ''}</div>
    </DayItem>
  )
}

const SelectionContainer = styled.div`

`

const SelectionTitle = styled.h2`
  font-size: ${font.h3()};
  background-color: ${color.blue};
  padding: 0.5rem;
`

const SelectionContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 0.5rem;
`

export const SelectionDetail = (props: {
  selectedDays: CalendarSelection,
  days: Array<CalendarDayJobs>
}) => {
  const [ title, setTitle ] = React.useState<string>('')
  const [ expectedTime, setExpectedTime ] = React.useState<number>(0)
  const [ workedTime, setWorkedTime ] = React.useState<number>(0)
  const [ dayCount, setDayCount ] = React.useState<number>(0)

  React.useEffect(() => {
    const startDate = new Date(props.selectedDays.start.date)
    const endDate = props.selectedDays.end?.date ? new Date(props.selectedDays.end.date) : new Date(props.selectedDays.start.date)
    const startString = ISOStringToFormatedDate(props.selectedDays.start.date, 'date')
    const endString = props.selectedDays.end?.date ? `- ${ISOStringToFormatedDate(props.selectedDays.end.date, 'date')}` : ''
    const rangeDays = props.days.filter((day) => day.date >= startDate.toISOString() && day.date <= endDate.toISOString())

    const timeData = rangeDays.reduce((result, day) => {
      const expected = getDayHours(day.schedule, new Date(day.date).getDay()) * 3600
      const worked = day.jobs.reduce((total, job) => {
        const jobEnd = job.endDatetime || new Date().toISOString()
        const diff = elapsedTime(
          ISOStringToFormatedDate(job.startDatetime),
          ISOStringToFormatedDate(jobEnd)
        )
        return total += diff
      }, 0)
      return {
        expected: result.expected += expected,
        worked: result.worked += worked / 1000
      }
    }, {
      expected: 0,
      worked: 0,
    })

    setExpectedTime(timeData.expected)
    setWorkedTime(timeData.worked)
    setTitle(`${startString}${endString}`)
    setDayCount(rangeDays.length)
  }, [props.selectedDays, props.days])

  return (
    <SelectionContainer>
      <SelectionTitle>{title}</SelectionTitle>
      <SelectionContent>
        <div>Días seleccionados: {dayCount}</div>
        <div>Esperado: {formatElapsedTimeFromSeconds(expectedTime)}</div>
        <div>Trabajado: {formatElapsedTimeFromSeconds(workedTime)}</div>
        <div>Diferencia: {formatElapsedTimeFromSeconds(workedTime - expectedTime)}</div>
      </SelectionContent>
    </SelectionContainer>
  )
}