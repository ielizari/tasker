import React from 'react'
import styled from 'styled-components'
import {common, font, color } from '../../../styles/theme'
import { BlockActions } from '../common/block-actions'

export const BlockContainer = styled.div`
    margin: 1rem;
    border-style: solid;
    border-color: #000;
    border-width: 1px;
    ${common.roundedCorners()};
`

const BlockTitle = styled.div`
    ${font.h3()};
    color: ${color.white};
    background-color: ${color.orange};
    ${common.roundedCornersTop()};
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
export const BlockHeaderComponent = (props) => {
    const [title, setTitle] = React.useState<string>(props.title || 'Sin título')
    const [actions, setActions] = React.useState<Array<any>>([])

    React.useEffect(() => {
        setActions(props.actions)
    },[actions])

    React.useEffect(() => {
        setTitle(props.title)
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