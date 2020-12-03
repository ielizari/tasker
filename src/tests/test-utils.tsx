import React from 'react'
import { render } from '@testing-library/react'
import { Router } from 'react-router-dom'
import { createMemoryHistory } from 'history'

interface renderOptions {
  route?: string
}

export const history = createMemoryHistory()
export const renderWithProviders = (
  ui: React.ReactNode,
  { route }: renderOptions = {},
) => {
  if (route) {
    history.push(route)
  }
  render(<Router history={history}>{ui}</Router>)
}