import React from 'react'
import styled from 'styled-components'
import { FaSpinner } from 'react-icons/fa'
import { color, common, font } from '../../../styles/theme'

const Container = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.6);
`
const SpinnerBox = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 3rem;
    background-color: ${color.white} !important;
    border-style: solid;
    border-width:2px;
    border-color: ${color.orange};
    color: ${color.darkGrey};
    ${common.roundedCorners()};
`
const SpinnerIcon = styled(FaSpinner)`
    margin: 0 auto;
    margin-bottom: 1rem;
`

const Message = styled.div`
    color: ${color.darkGrey}
    margin-top: 1rem;
    ${font.h3()};
`

export const Spinner = (props) => {
    const [message,setMessage] = React.useState<string>('Cargando ...')
    React.useEffect(() => {
        props.message? setMessage(props.message) : setMessage('Cargando ...')
    },[])

    return (
        <Container>
            <SpinnerBox>
                <SpinnerIcon size={75} className='icon-spin' />
                <Message>Cargando...</Message>
            </SpinnerBox>            
        </Container>
    )
}