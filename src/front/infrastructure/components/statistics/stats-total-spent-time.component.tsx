import React from 'react'
import styled from 'styled-components'
import { color, common, font } from '../../../styles/theme'
import { TaskDetail } from '../../../domain/task'
import { getTaskGroupedData } from '../../../application/getTaskGroupedData'
import { formatElapsedTimeFromSeconds } from '../../../../lib/date.utils'

const StatsContainer = styled.div`
    ${common.roundedCorners()};
    padding: 1rem;
`;

const StatsContainerTitle = styled.div`    
    ${font.h4()};
    ${color.grey};
    margin-top: 1rem;
    margin-bottom: 1rem;
`;

const StatsNumber = styled.div`
    ${color.black};
`;

export const StatsTotalSpentTimeComponent = (props: {title: String, task: TaskDetail}) => {
    const [task, setTask] = React.useState<TaskDetail>(props.task)
    const [spentTime, setSpentTime] = React.useState<Number | String>('-')

    React.useEffect(() => {
        getTaskGroupedData(task.id)
            .then(
                result => {
                    setSpentTime(formatElapsedTimeFromSeconds(result.data.timeInSeconds))
                },
                error => {
                    console.log("EEEError",error)
                }
            )
    },[task])

    React.useEffect(() => {
        setTask(props.task)
    },[props.task])

    return (
        <StatsContainer>
            <StatsContainerTitle>{props.title}</StatsContainerTitle>
            <StatsNumberComponent number={spentTime}/>
        </StatsContainer>
    )
}

export const StatsNumberComponent = (props: {number: Number | String}) => {
    const [number, setNumber] = React.useState<Number | String>(props.number || '-')
    React.useEffect(() => {
        setNumber(props.number)
    },[props.number])

    return (
        <StatsNumber>{number}</StatsNumber>
    )
}