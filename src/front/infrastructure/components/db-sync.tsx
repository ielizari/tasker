import React from 'react'
import styled from 'styled-components'
import { SyncStateContext } from '../../application/contexts/dbSyncContext'
import { exportDb } from '../../application/exportDatabase'
import { isSyncedDb } from '../../application/isSyncedDatabase'
import { FaSave } from 'react-icons/fa'
import { IconButton } from './common/icon-button'

const SyncWarningContainer = styled.div`
    background-color: red;
    padding: 1rem;
    text-align: center;
    color: #fff;
`

const exportDB = () => {              
    
    exportDb().then(
        (result) => {
            if(!result.hasError){
                let blob = new Blob([JSON.parse(result.data.blob)], { type: 'text/plain;charset=utf-8;' })
                let exportedFilename = result.data.filename
                
                if (navigator.msSaveBlob) { // IE 10+
                    navigator.msSaveBlob(blob, exportedFilename)
                } else {
                    var link = document.createElement('a')
                    if (link.download !== undefined) { // feature detection
                        // Browsers that support HTML5 download attribute
                        var url = URL.createObjectURL(blob)
                        link.setAttribute('href', url)
                        link.setAttribute('download', exportedFilename)
                        link.style.visibility = 'hidden'
                        document.body.appendChild(link)
                        link.click()
                        document.body.removeChild(link)
                    }
                }
            }else{
                console.log(result.error)
            }
        },
        (error) => {
            console.log(error)
        }
    )
}

const importDB = () => {

}

export const DbSync = () => {
    const syncCtx = React.useContext(SyncStateContext)
    const {sync, setSync} = syncCtx
    const [syncFail, setSyncFail] = React.useState<boolean>(false)
  
    React.useEffect(()=>{
        setSync({sync:true})
    },[])
    
    const handleExport = () => {
        exportDB()
        setSync({sync:true})
    }
    
    React.useEffect(()=>{
        isSyncedDb().then(
            result => {
                if(!result.hasError){
                    if(sync.sync === true && result.data === false){
                        setSync({sync: false})
                    }
                }else{
                    console.log(result.error)
                }
            },
            error => {
                console.log(error)
            }
        )
    },[sync])

    return (
        <>
        {!sync.sync &&
            <SyncWarningContainer>
                Necesita sincronización
                <button onClick={handleExport}>Download</button>
                <IconButton 
                    id='exportDb'
                    text=''
                    icon={FaSave}
                    onClick={handleExport}
                />
            </SyncWarningContainer>
        }
        </>
    )
}