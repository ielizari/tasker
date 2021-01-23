import React from 'react'
import { render } from '@testing-library/react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'
import { SyncProvider} from '../front/application/contexts/dbSyncContext'

interface renderOptions {
  route?: string
}


export const renderWithProviders = async(
  ui: React.ReactNode,
  { route }: renderOptions = {},
) => {
try{
  const history = createMemoryHistory()
    if (route) {
      history.push(route)
    }
    
    render(      
      <SyncProvider>
        <Router history={history}>{ui}</Router>
      </SyncProvider>
    )
}catch(e){
  throw e
}
}