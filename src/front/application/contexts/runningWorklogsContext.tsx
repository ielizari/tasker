import React from 'react'

const initialState = {
    runningWorklogs: []
}
export const RunningWorklogsStateContext = React.createContext({
    state: initialState,
    setState: (state) => {}
})

export const RunningWorklogsProvider = ({children}) => {
    const [state,setState] = React.useReducer((state,action) => {
        let res: any = state
        if(action.hasOwnProperty('worklogid')){
            if(!res.runningWorklogs.includes(action.worklogid)){
                res.runningWorklogs.push(action.worklogid)
            }
        }
       
        return {...res}
    },initialState)
    return (
        <RunningWorklogsStateContext.Provider value={{state,setState}}>            
            {children}
        </RunningWorklogsStateContext.Provider>
    )
}