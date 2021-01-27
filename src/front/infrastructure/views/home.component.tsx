import React  from 'react'
import styled from 'styled-components'
import { BlockContainer, BlockHeaderComponent} from '../components/common/block'
import { RunningWorklogsTable } from '../components/worklog/worklog-running.component'

const DashboardContainer = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-evenly
    gap: 1rem;
`

const PanelContainer = styled(BlockContainer)`
    flex-grow: 1;
    margin: 1rem;
`

const PanelBody = styled.div`
    display: flex;
    flex-grow: 1;
    padding: 1rem;
`

export const Panel = ({children}) => {
    return(       
        <PanelContainer>
            <BlockHeaderComponent title="Partes activos" />
            <PanelBody>{children}</PanelBody>
        </PanelContainer>
    )
}

export const Home = () =>  {
    return (
        
        <DashboardContainer> 
            <Panel>
                <RunningWorklogsTable />
            </Panel>
        </DashboardContainer>
          
    )
}