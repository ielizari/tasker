import React from 'react'
import { FaPlus, FaFilter } from 'react-icons/fa'
import { BlockContainer, BlockHeaderComponent, BlockEmptyComponent} from '../common/block'
import {
    ListContainer, 
    ListItem,
    ListItemTitleLink, 
} from '../common/list'
import { Spinner } from '../common/spinner'
import { getWorklogList} from '../../../application/getWorklogList'
import { Worklog } from '../../../domain/worklog'
import { Link } from 'react-router-dom'
import { common, color } from '../../../styles/theme'
import styled from 'styled-components'

// const ListItem = styled.li`
//     list-style: none;
//     padding: 1rem;
//     margin: 1rem;
//     border-style: solid;
//     border-width: 1px;
//     border-color: ${color.orange};
//     background-color: ${color.orange};
//     color: ${color.white};
//     ${common.roundedCorners()};
// `

const WorklogListItem = (props: {worklog: Worklog } ) => {    
    
    return(
        <ListItem>
            <ListItemTitleLink to={`/worklogs/${props.worklog.id}`}>
                {props.worklog.title}
            </ListItemTitleLink>
        </ListItem>
    )
}

export const WorklogListComponent = ( props ) => {
    const [worklogs, setWorklogs] = React.useState<Array<any>>([])
    const [error, setError] = React.useState<Error | null>(null)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [actions, setActions] = React.useState<Array<any>>([])
    const [filters, setFilters ] = React.useState<Partial<any>>(props.filter ||{})

    
    React.useEffect(() => {
        let cancelled = false
        setLoading(true)
        let actionItems = [
            {
                icon: FaPlus,
                text: 'Nuevo parte',
                route: `/worklogs/new`,
                type: 'link'
            },
            {
                view: 'actionBar',
                type: 'form',         
                key: 'actionBarFilterForm',   
                initValues: {actionBarSearch: ''},
                onSubmit: searchHandler,
                validation: validation,
                items: [
                    {
                        type: 'text',
                        id: 'actionBarSearch',
                        placeholder: 'Buscar...'
                    },
                    {        
                        id: 'filterBtn',
                        type: 'submit',
                        icon: FaFilter,
                        label: 'Filtrar',
                        className: 'button-icon'
                    }
                ]
                
            },
            
        ]
        setActions(actionItems)
        getWorklogList(filters)
            .then(
                (result) => {
                    if(!cancelled){
                        if(result.hasError){
                            setError(new Error(result.error));
                            setWorklogs([])
                        }else{
                            setWorklogs(result.data); 
                            setError(null);
                        }
                        
                        setLoading(false)
                    }
                },
                (error) => {
                    if(!cancelled){
                        setError(error)
                        setLoading(false)
                    }
                }
            )

        return () => cancelled = true
    },[filters])

    const searchHandler = (values) => {
        const filter: Partial<Worklog> = {}
        if(values.actionBarSearch){
            filter.title = values.actionBarSearch
        }
        setFilters(filter)
    }

    const validation = (values) => {
        const errors = []
        return errors
    }
    
    return (
        <BlockContainer>
            <BlockHeaderComponent 
                title='Partes de trabajo'
                actions={actions}
            />
            {loading && <Spinner />}
            {worklogs.length ?                 
                (error!==null ? 
                    <div>Error: {error.message?error.message:'unknown error'}</div> 
                    :
                    <ListContainer>
                    {
                        worklogs.map((item: Worklog) => (                            
                            <WorklogListItem key={item.id} worklog={item} />
                        ))
                    }
                    </ListContainer>
                )
                :
                <BlockEmptyComponent />
            }
        </BlockContainer>
    )
}