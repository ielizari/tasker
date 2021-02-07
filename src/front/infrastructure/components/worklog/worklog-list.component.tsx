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
import { Worklog, WorklogsFilter } from '../../../domain/worklog'

const defaultFilter: WorklogsFilter = {
    where: {}, 
    order: {
        orderByFields:['startDatetime'],
        orderDirections:['desc']
    }
}

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
    const [filters, setFilters ] = React.useState<WorklogsFilter>(props.filter || defaultFilter)
    
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
                initValues: {actionBarSearch: '', orderItems: 'startDesc'},
                onSubmit: searchHandler,
                validation: validation,
                items: [
                    {
                        type: 'text',
                        id: 'actionBarSearch',
                        placeholder: 'Buscar...'
                    },
                    {
                        type: 'select',
                        id: 'orderItems',
                        selOptions: [
                            {
                                label: 'Últimos creados primero',
                                value: 'startDesc',
                            },
                            {
                                label: 'Actividad reciente',
                                value: 'activityDesc'
                            }
                        ]
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
        console.log(values)
        const filter: WorklogsFilter = {where: {}, order: {orderByFields: ['startDatetime'], orderDirections: ['desc']}}
        if(values.actionBarSearch){
            filter.where.title = values.actionBarSearch
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