import React from 'react'
import styled from 'styled-components'
import '../../App.css';
import { font, color } from '../../styles/theme';
import { Spinner } from '../components/common/spinner'
import { BlockContainer, BlockHeaderComponent} from '../components/common/block'
import { FormBuilder } from '../components/common/form/form'
import { FaCheck, FaArrowLeft} from 'react-icons/fa'
import { importDb, importForm } from '../../application/importDatabase'
import { newDb } from '../../application/newDatabase'

const SetupButtons = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
`
const Button = styled.button`
    padding: 1rem;
    justify-content: center;
    background-color: ${color.lightBlue};
    color: ${color.white};
    min-width: 30%;
`
export const LoadDB = () => {
    const [title, setTitle] = React.useState<string>('Base de datos')
    const [error, setError] = React.useState<Error | null>(null)
    const [loading, setLoading] = React.useState<boolean>(false)
    const [submitSuccess, setSubmitSuccess] = React.useState<boolean>(false)
    const [submitError, setSubmitError] = React.useState<Error | null>(null)
    const [setupView, setSetupView] = React.useState<string>('select')

    const renderView = (): string => {
        if(setupView === 'newDB'){
            return 'newDB'
        }else if(setupView === 'importDB'){
            return 'importDB'
        }else{
            return 'select'
        }
    } 
    
    const backButton = () => {
        setSetupView('select')
    }

    const newEmptyDatabase = () => {
        setLoading(true)
        newDb().then(
            result => {
                if(result.hasError){
                    setSubmitError(error)
                }else{
                    setSubmitSuccess(true)
                }
                setLoading(false)
            },
            error => {
                setSubmitError(error)
                setLoading(false)
            }
        )
    }
    let formItems = 
         [            
            {
                type: 'file',
                id: 'dbfile',
                label: 'Importar database'
            },            
            {
                type: 'buttons',
                buttons: [
                    {        
                        id: 'submitBtn',
                        type: 'submit',
                        icon: FaCheck,
                        label: 'Guardar',
                        className: 'form-button-submit button-icon'
                    },
                    {        
                        id: 'cancelBtn',
                        type: 'button',
                        icon: FaArrowLeft,
                        label: 'Volver',
                        onClick: backButton,
                        className: 'button-icon'
                    }
                ]
            }            
         ]

    let initialValues = {dbfile: null}

    
    const validate = (values: Partial<importForm>) => {
        const errors: any = {}
        if(!values.dbfile){
            errors.dbfile = 'Debes seleccionar un archivo'
        }
       
        return errors
    }

    const onSubmit = (values: importForm) => {
        setLoading(true)
        importDb(values).then(
            result => {
                if(result.hasError){
                    setSubmitError(error)
                }else{
                    setSubmitSuccess(true)
                }
                setLoading(false)
            },
            error => {
                setSubmitError(error)
                setLoading(false)
            }
        )
    }
    return (
        <>            
            <BlockContainer> 
            <BlockHeaderComponent 
                title="Crear base de datos"
            />  
            {loading ? <Spinner /> : ''}            
           
            {submitSuccess &&                
                <div aria-label='success-message' className='message-success'>                    
                    La base de datos se ha importado correctamente
                </div>  
            }
            {submitError &&
                <div aria-label='error-message' className='message-error'>{submitError.message}</div>
            }
            
            {renderView() === 'select' &&
                <SetupButtons>
                    <Button onClick={newEmptyDatabase}>Nueva base de datos</Button>
                    <Button onClick={() => {setSetupView('importDB')}}>Importar base de datos</Button>
                </SetupButtons>
                
            }

            {renderView() === 'importDB' &&
                <FormBuilder 
                    key = "setupForm"
                    formView = "form"
                    formItems = {formItems}
                    initValues = {initialValues}
                    validation = {validate}
                    onSubmit = {onSubmit}
                />
            }
            
        </BlockContainer>
        </>
    )
}