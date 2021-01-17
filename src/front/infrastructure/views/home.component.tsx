import React  from 'react'
import styled from 'styled-components'
import { color } from '../../styles/theme'
import { BlockContainer} from '../components/common/block'
import { RunningWorklogsTable } from '../components/worklog/worklog-running.component'

const DashboardContainer = styled(BlockContainer)`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly
    gap: 1rem;
`
const DashboardHeader = styled.h3`
    width: 100%;
`

const PanelContainer = styled.div`
    display: flex;
    flex-direction: column;
    color: ${color.black};
    flex-grow: 1;
    margin: 1rem;
`
const PanelHeader = styled.div`
    padding: 0.5rem;
    background-color: ${color.white};
    color: ${color.orange};
    font-weight: bold;
    font-size: 1.2rem;
    border-style: solid;
    border-width: 0 0 1px 0;
    border-color: ${color.orange};
`

const PanelBody = styled.div`
    display: flex;
    flex-grow: 1;
    padding: 1rem;
`

export const Panel = ({children}) => {
    return(
        <PanelContainer>
            <PanelHeader>Partes activos</PanelHeader>
            <PanelBody>{children}</PanelBody>
        </PanelContainer>
    )
}

export const Home = () =>  {
    return (     
        <DashboardContainer>
            <DashboardHeader className="section-title">Información general</DashboardHeader>            
            <Panel><RunningWorklogsTable /></Panel>
        </DashboardContainer>
    )
}