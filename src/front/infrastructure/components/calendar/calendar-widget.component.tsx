import React from 'react'
import styled from 'styled-components'
import { color } from 'src/front/styles/theme'
import { CalendarTime, Calendar } from 'src/front/domain/calendar'
import { formatElapsedTime, ISOStringToFormatedDate, elapsedTime } from 'src/lib/date.utils'
import { RunningElapsedTime } from '../worklog/worklog-sequence.component'

const CalendarWidgetContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`

const CalendarTitle = styled.div`
  font-weight: bold;
`

const StatusContainer = styled.div`
  display: inline-grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 0.7rem;
  margin-left: 0.5rem;
`

const StatusTitle = styled.span`

`

const StatusValue = styled.span`

`

const StatusDiff = styled.span<{
  negative?:boolean,
}>`
  display: flex;
  flex-direction: row;
  color: ${props => props.negative ? color.lightRed : color.lightGreen}
`;

const getRunningJobTime = (runningJob: string): number => {
  return runningJob ? elapsedTime(
    ISOStringToFormatedDate(runningJob,'datetime','dmy/','hms'),
    ISOStringToFormatedDate(new Date().toISOString(),'datetime','dmy/','hms')
  ) : 0
}

export const CalendarWidget = (props: {calendar: Calendar, runningJob: string}) => {
  const [ calendar, setCalendar ] = React.useState<Calendar>(null)
  const [ status, setStatus ] = React.useState<CalendarTime>(null)

  React.useEffect(() => {
    setCalendar(props.calendar)
    setStatus(props.calendar?.status || null)
  }, [props.calendar])

  return (
    <CalendarWidgetContainer>
      <CalendarTitle>{calendar?.title || '-'}</CalendarTitle>
      <CalendarStatusItem
        title='Total:'
        expected={status?.currentExpectedTime}
        current={status?.workedTime}
        runningJob={props.runningJob}
      />
      <CalendarStatusItem
        title='Mes:'
        expected={status?.currentMonthExpectedTime}
        current={status?.currentMonthWorkTime}
        runningJob={props.runningJob}
      />
      <CalendarStatusItem
        title='Semana:'
        expected={status?.currentWeekExpectedTime}
        current={status?.currentWeekWorkTime}
        runningJob={props.runningJob}
      />
    </CalendarWidgetContainer>
  )
}

export const CalendarStatusItem = (props: { title: string, expected: number, current: number, runningJob: string}) => {
  const [currentTime, setCurrentTime] = React.useState<string>('-')
  const [diffTime, setDiffTime] = React.useState<string>('-')
  const [runningJobTime, setRunningJobTime] = React.useState<number>(0)

  React.useEffect(() => {
    const current = formatElapsedTime(props.current)
    const diff = formatElapsedTime(props.current - props.expected)
    setCurrentTime(current)
    setDiffTime(diff)
    setRunningJobTime(getRunningJobTime(props.runningJob))

  }, [props])
  return (
    <StatusContainer>
      <StatusTitle>{props.title}</StatusTitle>
      <StatusValue>
      {props.runningJob ?
        <RunningElapsedTime start={props.runningJob} initialSeconds={props.current/1000}/> :
        currentTime
      }
      </StatusValue>
      <StatusDiff negative={props.expected >= props.current + runningJobTime}>(
      {props.runningJob ?
        <RunningElapsedTime
          start={props.runningJob}
          initialSeconds={(props.expected - props.current)/1000 * (props.expected >= props.current ? -1 : 1)}/> :
        diffTime
      })
      </StatusDiff>
    </StatusContainer>
  )
}