import React from 'react'
import styled from 'styled-components'
import { color, common } from '../../styles/theme'
import { SyncStateContext } from '../../application/contexts/dbSyncContext'
import { exportDb } from '../../application/exportDatabase'
import { isSyncedDb } from '../../application/isSyncedDatabase'
import { FaSave } from 'react-icons/fa'
declare global {
  interface Navigator {
    msSaveBlob?: (blob: any, defaultName?: string) => boolean
  }
}

const SyncWarningContainer = styled.div`
  text-align: center;
`
const ExportButton = styled.button`
  ${common.roundedCorners('50%')};
  border-style: solid;
  border-width: 2px;
  border-color: ${color.saveIconColor};
  color: ${color.saveIconColor};
  background-color: rgba(0,0,0,0);
  animation-name: iconglow;
  animation-duration: 2s;
  animation-iteration-count: infinite;

  @keyframes iconglow {
      from {
          opacity: 0;
      }
      to {
          opacity: 100;
      }
  }
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

export const DbSync = () => {
  const syncCtx = React.useContext(SyncStateContext)
  const {sync, setSync} = syncCtx

  React.useEffect(()=>{
      setSync({sync:true})
  },[setSync])

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
  },[sync, setSync])

  return (
    <>
    {!sync.sync &&
      <SyncWarningContainer>
        <ExportButton
            id='export'
            key='export'
            aria-label='export'
            onClick={handleExport}
        ><FaSave /></ExportButton>
      </SyncWarningContainer>
    }
    </>
  )
}