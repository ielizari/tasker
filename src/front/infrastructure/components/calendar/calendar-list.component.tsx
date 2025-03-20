import React from 'react'
import styled from 'styled-components'
import { common } from '../../../styles/theme'
import {
  ListContainer,
  ListItem,
  ListItemExpand,
  ListItemTitleResult,
  ListChildContainer,
  ListItemTitleLink
} from '../common/list'
import { Calendar, CalendarsFilter } from '../../../domain/calendar'
import { getCalendarList } from '../../../application/getCalendarList'
import { FaFilter, FaPlus, FaMinus } from 'react-icons/fa'
import { IconLink } from '../common/icon-button'

import { Spinner } from '../common/spinner'

import { BlockHeaderComponent, BlockContainer, BlockEmptyComponent } from '../common/block'

const defaultFilter: CalendarsFilter = {
  where: {},
  order: {
    orderByFields:['id'],
    orderDirections:['desc']
  }
}

const CalendarListItem = (props: {calendar: Calendar, resultHandler? } ) => {
  return(
    <ListItem>
      {props.resultHandler ?
        <ListItemTitleResult
          onClick={() => props.resultHandler(props.calendar)}
        >
          {props.calendar.title}
        </ListItemTitleResult>
        :
        <ListItemTitleLink to={`/calendars/${props.calendar.id}`}>
          {props.calendar.title}
        </ListItemTitleLink>
      }
      
    </ListItem>
  )
}

const CalendarListWidget = (props: {calendars: Array<Calendar>, resultHandler?}) => {
  return (
    <>
    {
      props.calendars.map((item: Calendar) => (
        <CalendarListItem key={item.id} calendar={item} resultHandler={props.resultHandler}/>
      ))
    }
    </>
  )
}

export const CalendarListComponent = (props) => {
  const [calendars, setCalendars] = React.useState<Array<Calendar>>([])
  const [error, setError] = React.useState<Error | null>(null)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [actions, setActions] = React.useState<Array<any>>([])
  const [filters, setFilters ] = React.useState<CalendarsFilter>(props.filter || defaultFilter)

  React.useEffect((): void => {
    let cancelled = false
    setLoading(true)
    let actionItems = [
      {
        icon: FaPlus,
        text: 'Nuevo calendario',
        route: `/calendars/new`,
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
    getCalendarList(filters)
      .then(
        (result) => {
          if(!cancelled){
            if(result.hasError){
              setError(new Error(result.error));
              setCalendars([])
            }else{
              setCalendars(result.data);
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
  },[filters])

  const searchHandler = (values) => {
    console.log(values)
    const filter: CalendarsFilter = {where: {}, order: {orderByFields: ['startDatetime'], orderDirections: ['desc']}}
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
        title='Calendarios'
        actions={actions}
      />
      {loading && <Spinner />}
      <ListContainer>
        {calendars.length ?
          (error!==null ?
            <div>Error: {error.message?error.message:'unknown error'}</div>
            :
            <CalendarListWidget calendars={calendars} resultHandler={props.resultHandler} />
          )
          :
          <BlockEmptyComponent />
        }
      </ListContainer>
    </BlockContainer>
  )
}