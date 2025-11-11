import styled from 'styled-components'
import { color } from '../../../styles/theme'
import { Link } from 'react-router-dom'

export const ListContainer = styled.div<{withChildren?:boolean}>`
  display: grid;
  grid-template-columns: ${props => props.withChildren ? 'min-content auto' : 'auto'};
  row-gap: 1px;
  background-color: ${color.black};
  margin: 1rem;    
  border-width: 1px;
  border-color: ${color.black};
  border-style: solid;
  }
`

export const ListItem = styled.div`
  display: flex;
  flex-direction: row;
  background-color: ${color.lightGrey};
  color: ${color.black};    
`

export const ListItemContainer = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${color.lightGrey};
`

export const ListItemBreadcrumbs = styled.div`
  display: flex;
  flex-direction: row;
  gap: 1rem;
  padding-left: 1rem;
`

export const ListItemBreadcrumbLink = styled(Link)`
  font-size: 0.8rem;
  :hover {
    text-decoration: underline;
  }
`

export const ListItemTitleLink = styled(Link)<{$breadcrumbs?: boolean}>`
  width: 100%;
  padding: ${props => props.$breadcrumbs ? '0.5rem' : '1rem'};
`
export const ListItemTitleResult = styled.div`
  width: 100%;
  padding: 1rem;
  cursor: pointer;
`

export const ListItemExpand = styled.div<{expanded?: boolean}>`
  display: inline-flex;
  padding: 0.7rem;
  flex-direction: row;
  cursor: pointer;
  justify-content: center;
  align-items: ${props => props.expanded ? 'top' : 'center'};
  gap: 0.3rem;
  background-color: ${color.blockTitleBackground};
  color: ${color.white};
`
export const ListChildContainer = styled.div`
  display: grid;
  grid-template-columns: min-content auto;
  row-gap: 1px;
  background-color: ${color.black};
  
  border-style: solid;
  border-width: 1px 0 0 1px;
  border-color: ${color.black};    
`