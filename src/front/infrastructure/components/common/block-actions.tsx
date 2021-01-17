import React from 'react'
import styled from 'styled-components'
import { color } from '../../../styles/theme'
import { IconLink, IconButton } from '../common/icon-button'
import { IconType} from 'react-icons'
import { FormBuilder } from '../common/form/form'

const BlockActionsContainer = styled.div`
    display: flex;
    background-color: ${color.lightGrey};
    padding: 0.5rem;
    flex-wrap: wrap;
    flex-direction: row;
`
export interface Action {
    key: string
    route: string
    text: string
    icon: IconType | null
    handler: any
    type?: string
    view?: string
    items?: Array<Action>
    initValues?: Partial<Action>
    validation?: object
    onSubmit?: object
}

export const BlockActions = (props) => {
    const [actions,setActions] = React.useState<Array<Action>>(props.actions || [])    
  
    React.useEffect(() => {
        setActions(props.actions)
    },[props.actions])

    return (
        <BlockActionsContainer>
            {
                (actions && actions.length > 0) ?
                    actions.map((action: Action) => {                
                        if(!action.type || action.type === 'link'){
                            return (                                
                                <IconLink 
                                    key={action.text}
                                    route={action.route}
                                    text={action.text}
                                    icon={action.icon}
                                />
                            )
                        }else if(action.type === 'button'){
                            return (
                                <IconButton 
                                    key={action.text}
                                    text={action.text}
                                    icon={action.icon}
                                    onClick={action.handler}
                                />
                            )
                        }else if(action.type === 'form'){
                            return (
                                <FormBuilder 
                                    key = {action.key }
                                    formView = {action.view}
                                    formItems = {action.items}
                                    initValues = {action.initValues}
                                    validation = {action.validation}
                                    onSubmit = {action.onSubmit}
                                />
                            )
                        }else{
                            return (<></>)
                        }                       
                    })
                    :
                    ''
            }
        </BlockActionsContainer>
    )
}