import React from 'react'
import styled from 'styled-components'
import { color, common } from '../../../styles/theme'
import { Link } from 'react-router-dom'

const LinkWrapper = styled(Link)`  
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    background-color: ${color.lightGrey};
    ${common.roundedCorners()};
    padding: 0.5rem;
    flex-wrap: wrap;
    color: ${color.veryDarkGrey} !important;    
    transition: background-color .3s;

    :hover, :hover span{
        background-color: ${color.semiLightGrey};
    }
`;

const ButtonWrapper = styled.button`  
    display: inline-flex;
    align-items: center;
    justify-content: space-between;
    background-color: ${color.lightGrey};
    ${common.roundedCorners()};
    padding: 0.5rem;
    color: ${color.veryDarkGrey} !important;
    transition: background-color .3s;

    :hover, :hover span{
        background-color: ${color.semiLightGrey};
    }
`;

const IconWrapper = styled.div`
    display: inline-flex;
    align-items: center;
    
    transition: background-color .3s;
`

const TextWrapper = styled.div`
    margin-left: 1rem;
`

export const IconButton = (props) => {
    const [text, setText] = React.useState('')  
    const [Icon, setIcon] = React.useState(null)
    const [type, setType] = React.useState(null)

    React.useEffect(()=> {
        setIcon(props.icon)
    },[props.icon])
    
    React.useEffect(()=> {
        setText(props.text)
    },[props.text])

    React.useEffect(() => {
        setType(props.type || 'button')
    },[props.type])
    

    return (
        <ButtonWrapper
            className={props.className}
            onClick={props.onClick}
            role="button"
            aria-label={props.text}
            type={type}
        >
            <IconWrapper>{Icon}</IconWrapper>       
            {text && 
                <TextWrapper>{text}</TextWrapper>
            }
        </ButtonWrapper>
    )
}


export const IconLink = (props) => {
    const [route, setRoute] = React.useState(props.route || '')
    const [text, setText] = React.useState(props.text || '')
    const [Icon, setIcon] = React.useState(null)

    React.useEffect(()=> {
        setIcon(props.icon)
    },[props.icon])

    React.useEffect(()=> {
        setRoute(props.route)
    },[props.route])

    React.useEffect(()=> {
        setText(props.text)
    },[props.text])

    return (
        <LinkWrapper 
            to={route} 
            className={props.className}
            onClick={props.onClick}
            role="button"
            aria-label={text}
            >
            <IconWrapper>{Icon}</IconWrapper>
            {text && 
                <TextWrapper>{text}</TextWrapper>
            }
        </LinkWrapper>
    )
}