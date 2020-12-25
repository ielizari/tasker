import React from 'react'

export const SyncStateContext = React.createContext({
    sync: false,
    setSync: (sync) => {}
})
export const SyncDispatchContext = React.createContext(()=> {})

export const SyncProvider = ({children}) => {
    const [sync,setSync] = React.useReducer((synced,action) => {
        return action
    },false)
    return (
        <SyncStateContext.Provider value={{sync,setSync}}>
            {children}
        </SyncStateContext.Provider>
    )
}
