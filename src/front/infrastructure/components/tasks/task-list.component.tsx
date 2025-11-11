import React from 'react'
import styled from 'styled-components'
import { common } from '../../../styles/theme'
import {
  ListContainer,
  ListItemExpand,
  ListItemContainer,
  ListItemBreadcrumbs,
  ListItemBreadcrumbLink,
  ListItemTitleResult,
  ListChildContainer,
  ListItemTitleLink
} from '../common/list'
import { TaskObject, TaskDetail, TaskItem } from '../../../domain/task'
import { getTaskList } from '../../../application/getTaskList'
import { FaFilter, FaPlus, FaMinus } from 'react-icons/fa'
import { IconLink } from '../common/icon-button'

import { Spinner } from '../common/spinner'

import { BlockHeaderComponent, BlockContainer, BlockEmptyComponent } from '../common/block'

const AddTaskButton = styled(IconLink)`
  ${common.blockButton()};
`
const TaskItemBreadcrumbs = (props: {breadcrumbs: Array<TaskItem>}) => {
  return (
    <ListItemBreadcrumbs>
      {
        props.breadcrumbs?.length && props.breadcrumbs?.slice(1)?.reverse().map((task, index) => (
          <>
            {index > 0 && index < props.breadcrumbs.length && ' > '}
            <ListItemBreadcrumbLink to={`tasks/${task.id}`}>{task.title}</ListItemBreadcrumbLink>
          </>
        ))
      }
    </ListItemBreadcrumbs>
  )
}

const TaskListItem = (props: {item: TaskObject, resultHandler? } ) => {
  const [showChildren, setShowChildren] = React.useState<boolean>(false)
  const [ childrenTasks, setChildrenTasks ] = React.useState<Array<TaskObject>>([])
  const [loading, setLoading] = React.useState<boolean>(false)

  const loadChildren = () => {
    getTaskList({parent: props.item.task.id})
      .then(
        (result) => {
          if(result.hasError){
            console.log(result.error);
            setChildrenTasks([])
          }else{
            setChildrenTasks(result.data)
          }
          setLoading(false)
        },
        (error) => {
          console.log(error)
          setLoading(false)
        }
      )
    setShowChildren(!showChildren)
  }
  return(
    <>
      {loading && <Spinner />}
      <>
        <ListItemExpand expanded={showChildren} onClick={loadChildren}>
          {showChildren ?
            <FaMinus />
            :
            <FaPlus />
          }
          ({props.item.childTasks.length})
        </ListItemExpand>
        <ListItemContainer>
          <TaskItemBreadcrumbs 
            breadcrumbs={props.item.parentTaskChain}
          />
          {props.resultHandler ?
            <ListItemTitleResult 
              onClick={() => props.resultHandler(props.item.task)}>
                {props.item.task.title}
            </ListItemTitleResult>
            :
            <ListItemTitleLink 
              to={`/tasks/${props.item.task.id}`}
              $breadcrumbs={props.item.parentTaskChain?.length>1}
            >
              {props.item.task.title}
            </ListItemTitleLink>
          }
          {showChildren &&
            <ListChildContainer>
              <TaskListWidget tasks={childrenTasks} resultHandler={props.resultHandler}/>
            </ListChildContainer>
          }
        </ListItemContainer>
      </>      
    </>
  )
}

const TaskListWidget = (props: {tasks: Array<TaskObject>, resultHandler?}) => {
  return (
    <>
    {
      props.tasks.map((item: TaskObject) => (
        <TaskListItem key={item.task.id} item={item} resultHandler={props.resultHandler}/>
      ))
    }
    </>
  )
}
export const TaskListComponent = (props) => {
  const [tasks, setTasks] = React.useState<Array<TaskObject>>([])
  const [error, setError] = React.useState<Error | null>(null)
  const [loading, setLoading] = React.useState<boolean>(false)
  const [actions, setActions] = React.useState<Array<any>>([])
  const [filters, setFilters ] = React.useState<Partial<TaskDetail>>(props.filter ||{parent: ''})

  const searchHandler = (values) => {
    const filter: Partial<TaskDetail> = {
      parent: '',
      ...(values.actionBarSearch && { title: values.actionBarSearch}),
      ...(values.orderItems && { sorting: values.orderItems})
    }
    setFilters(filter)
  }

  const validation = (values) => {
    const errors = []
    return errors
  }

    React.useEffect((): void => {
      let cancelled = false
      setLoading(true)
      let actionItems = [
        {
          view: 'actionBar',
          type: 'form',
          key: 'actionBarFilterForm',
          initValues: {actionBarSearch: ''},
          onSubmit: searchHandler,
          validation: validation,
          items: [
            // {
            //     type: 'checkbox',
            //     id: 'tasklistGroup',
            //     label: 'Agrupar',
            //     value: true
            // },
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
      getTaskList(filters)
        .then(
          (result) => {
            if(!cancelled){
              if(result.hasError){
                setError(new Error(result.error));
                setTasks([])
              }else{
                setTasks(result.data);
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

  return (
  <BlockContainer>
    <BlockHeaderComponent
      title='Tareas'
      actions={actions}
    />
    {loading && <Spinner />}

    <ListContainer withChildren={true}>
    {tasks.length ?
      (error!==null ?
        <div>Error: {error.message?error.message:'unknown error'}</div>
        :
        <TaskListWidget tasks={tasks} resultHandler={props.resultHandler} />
      )
      :
      <BlockEmptyComponent />
    }
    </ListContainer>
    <AddTaskButton
        icon={FaPlus}
        text='Nueva tarea'
        route={`/tasks/new`}
        type='link'
    />
  </BlockContainer>
  )
}