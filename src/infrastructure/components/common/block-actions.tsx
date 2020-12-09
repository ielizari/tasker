import React from 'react'
import styled from 'styled-components'
import { color, font, common } from '../../../styles/theme'
import { IconLink, IconButton } from '../common/icon-button'
import { IconType} from 'react-icons'

const BlockActionsContainer = styled.div`
    display: flex;
    background-color: ${color.lightGrey};
    padding: 0.5rem;
    flex-direction: row;
`
export interface Action {
    key: string,
    route: string,
    text: string,
    icon: IconType | null,
    handler: any,
    type?: string
}

export const BlockActions = (props) => {
    const [actions,setActions] = React.useState<Array<Action>>([])
    
    React.useEffect(() => {
        setActions(props.actions)
    },[actions])

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
                        }
                    })
                    :
                    ''
            }
        </BlockActionsContainer>
    )
}