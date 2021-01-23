import React from 'react'
import ReactDOM from 'react-dom'
import styled from 'styled-components'
import { color, common, font} from '../../../styles/theme'
import { FaTimes, FaCheck } from 'react-icons/fa'
import { IconButton } from './icon-button'

const modalRoot = document.createElement('div');
modalRoot.setAttribute('id', 'modalContainer');
document.body.append(modalRoot);

const modalContainer = document.querySelector("#modalContainer")

const DialogWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    overflow: scroll;
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0,0,0,0.7);
`

const DialogContent = styled.div`
    ${common.roundedCorners()};
    ${common.shadow()};
    width: 50%;
    background-color: ${color.white};
`

const DialogHeader = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    background-color: ${color.orange};
    color: ${color.white};
    padding: 0.75rem
`
const HeaderTitle = styled.h3`
    display: inline-flex;
    text-align: left;
    ${font.h3()};
`
const CloseModalButton = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    margin-left: 2rem;
    color: ${color.white};
    cursor: pointer;
    padding: 0.5rem;
    transition: background-color .3s;
    -webkit-border-radius: 50%;
    -moz-border-radius: 50%;
    border-radius: 50%;   

    :hover {     
        background-color: ${color.darkOrange}; 
    }
`

const DialogBody = styled.div`
    background-color: ${color.lightGrey};
    color: ${color.veryDarkGrey};
    padding: 1.5rem;
`
const DialogButtons = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;

`

export const ModalWithComponent = ({isOpened, onClose, Component, resultHandler}) => {    

    return(
        <>
            {isOpened &&
                ReactDOM.createPortal(
                    <DialogWrapper role="dialog" onClick={(e: any) => {
                        if(e.target.contains(document.getElementById('modalContent')))
                            onClose(e)
                    }}>
                        <DialogContent id="modalContent" role="document">                            
                            <Component resultHandler={resultHandler} />
                        </DialogContent>
                    </DialogWrapper>
                    , modalContainer
                )                
            }
        </>
    )
}
export const Modal = ({title, isOpened, onClose, action, content, type}) => {
    return(
        <>
            {isOpened &&
                ReactDOM.createPortal(
                    <DialogWrapper role="dialog" onClick={(e: any) => {
                        if(e.target.contains(document.getElementById('modalContent')))
                            onClose(e)
                    }}>
                        <DialogContent id="modalContent" role="document">
                            <DialogHeader>
                                <HeaderTitle>{title}</HeaderTitle>
                                <CloseModalButton onClick={onClose}><FaTimes /></CloseModalButton>
                            </DialogHeader>
                            <DialogBody>
                                {content}
                                {type === 'confirm' ? 
                                    <DialogButtons>
                                        <IconButton
                                            key="modalConfirm"
                                            text="Aceptar"
                                            icon={FaCheck}
                                            onClick={action}
                                            className="form-button-submit button-icon"
                                            />
                                        <IconButton
                                            key="modalCancel"
                                            text="cancelar"
                                            icon={FaTimes}
                                            onClick={onClose}
                                            className="form-button-cancel button-icon"
                                        />
                                    </DialogButtons>
                                :
                                    <DialogButtons>
                                        <IconButton
                                            key="modalConfirm"
                                            text="Aceptar"
                                            icon={FaCheck}
                                            onClick={onClose}
                                            className="form-button-submit button-icon"
                                            />
                                    </DialogButtons>
                                }
                            </DialogBody>
                        </DialogContent>
                    </DialogWrapper>
                    , modalContainer
                )                
            }
        </>
    )
}