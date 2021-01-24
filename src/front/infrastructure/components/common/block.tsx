import React from 'react'
import styled from 'styled-components'
import {common, font, color } from '../../../styles/theme'
import { BlockActions } from '../common/block-actions'

export const BlockContainer = styled.div`
    margin: 1.5rem;
    border-style: solid;
    border-color: #f00;
    border-width: 1px;
    ${common.roundedCorners()};
    background-color: ${color.blockBackground}
`

const BlockTitle = styled.div`
    ${font.h3()};
    color: ${color.blockTitleColor};
    background-color: ${color.blockTitleBackground};
    ${common.roundedCornersTop()};
    ${common.blockTitleGradient()};
    padding: 1rem;
`
export const BlockContent = styled.div`
    padding: 1rem;
`

export const BlockEmptySet = styled.div`
    display: flex;
    justify-content: center;
    padding: 1rem;
    font-style: italic;
    color: ${color.black}
`

export const BlockEmptyComponent = () => {
    return (
        <BlockEmptySet>
            No se han encontrado resultados
        </BlockEmptySet>
    )
}
export const BlockHeaderComponent = (props : {actions?,title?}) => {
    const [title, setTitle] = React.useState<string>(null)
    const [actions, setActions] = React.useState<Array<any>>([])

    React.useEffect(() => {
        setActions(props.actions)
    },[props.actions])

    React.useEffect(() => {
        if(props.title){
            setTitle(props.title)
        }else{
            setTitle('Sin título')
        }
    },[props.title])

    
    return (
        <>
            <BlockTitle>{title}</BlockTitle>     
            {actions && actions.length > 0 &&
                <BlockActions 
                    actions={actions}
                />
            }
        </>
    )
}