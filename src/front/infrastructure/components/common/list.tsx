import styled from 'styled-components'
import { color } from '../../../styles/theme'
import { Link } from 'react-router-dom'

export const ListContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding: 1rem;

    & div {
        border-style: solid;
        border-width: 0 1px 1px 1px;
        border-color: ${color.orange};
    }
    & div:first-child {
        border-width: 1px;
    }
    
`

export const ListItem = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;    
    background-color: ${color.lightGrey};
    color: ${color.black};
`

export const ListItemTitleLink = styled(Link)`
    width: 100%;
    padding: 1rem;
`
export const ListItemTitleResult = styled.div`
    width: 100%;
    padding: 1rem;
    cursor: pointer;
`

export const ListItemExpand = styled.div`
    display: inline-flex;
    padding: 1rem;
    cursor: pointer;
    justify-content: center;
    align-items: center;
    border-width: 0 !important;
    gap: 0.3rem;
    background-color: ${color.blockTitleBackground};
    color: ${color.white};
`
export const ListChildContainer = styled.div`
    display: flex;
    flex-direction: column;
    padding-left: 1rem;

    & div {
        border-style: solid;
        border-width: 0 0 1px 0 !important;
        border-color: ${color.orange};
    }

    & div:last-child, div:first-child {
        border-width: 0 !important;
    }
    
`