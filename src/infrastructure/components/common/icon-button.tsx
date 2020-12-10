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
    padding: 1rem;
    color: ${color.veryDarkGrey} !important;
    margin: 0.5rem;
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
    padding: 1rem;
    color: ${color.veryDarkGrey} !important;
    margin: 0.5rem;
    transition: background-color .3s;

    :hover, :hover span{
        background-color: ${color.semiLightGrey};
    }
`;

const IconWrapper = styled.span`
    display: inline-flex;
    align-items: center;
    margin-right: 1rem;
    transition: background-color .3s;
`

export const IconButton = (props) => {
    const [icon,setIcon] = React.useState(null)
    const [text, setText] = React.useState('')

    React.useEffect(()=> {
        setIcon(props.icon)
        setText(props.text)
    },[])

    
    return (
        <ButtonWrapper
            className={props.className}
            onClick={props.onClick}
            role="button"
            aria-label={props.text}
            type={props.type}
        >
            <IconWrapper className={props.className}>{icon}</IconWrapper>       
            {text}
        </ButtonWrapper>
    )
}

export const IconLink = (props) => {
    const [icon,setIcon] = React.useState(null)
    const [route, setRoute] = React.useState('')
    const [text, setText] = React.useState('')

    React.useEffect(()=> {
        setIcon(props.icon)
        setRoute(props.route)
        setText(props.text)
    },[])

    return (
        <LinkWrapper 
            to={route} 
            className={props.className}
            onClick={props.onClick}
            role="button"
            aria-label={props.text}
            >
            <IconWrapper className={props.className}>{icon}</IconWrapper>       
            {text}
        </LinkWrapper>
    )
}