import React  from 'react'
import styled from 'styled-components'
import { BlockContainer, BlockHeaderComponent, BlockContent} from '../components/common/block'

const AboutContent = styled(BlockContent)`
    justify-content: center;
    padding: 1.5rem;
`

const SectionContainer = styled.div`
    text-align: center;
    margin: 1rem 0;
`
const SectionTitle = styled.div`
    font-weight: bold;
`
const SectionContent = styled.div`

`

export const About = () =>  {
    return (        
        <BlockContainer>
            <BlockHeaderComponent title="Acerca de..." />
            <AboutContent>
                <SectionContainer>
                    <SectionTitle>Version</SectionTitle>
                    <SectionContent>0.1</SectionContent>
                </SectionContainer>
                <SectionContainer>
                    <SectionTitle>Autor</SectionTitle>
                    <SectionContent>Iñaki Elizari Reta</SectionContent>
                </SectionContainer>              
            </AboutContent>
        </BlockContainer>
          
    )
}