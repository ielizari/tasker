import React from 'react'

const initialState = {
    sync: true,
    existsDb: false
}
export const SyncStateContext = React.createContext({
    sync: initialState,
    setSync: (sync) => {}
})
export const SyncDispatchContext = React.createContext(()=> {})

export const SyncProvider = ({children}) => {
    const [sync,setSync] = React.useReducer((synced,action) => {
        let res: any = synced
        if(action.hasOwnProperty('sync')){
            res.sync = action.sync
        }
        if(action.hasOwnProperty('existsDb')){
            res.existsDb = action.existsDb
        }
        
        if(action.sync === true){
            window.onbeforeunload = null
        }else{
            window.onbeforeunload = (e) => {
                let message = "Hay cambios en la base de datos sin guardar. ¿Desea salir del sitio de todos modos?";                   
                (e || window.event).returnValue = message; //Gecko + IE
                return message;
            }
        }
        return {...res}
    },initialState)
    return (
        <SyncStateContext.Provider value={{sync,setSync}}>            
            {children}
        </SyncStateContext.Provider>
    )
}
