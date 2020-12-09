export const TaskStatus = {
    pending:        { label: "Pendiente",   value: "1"},
    incomplete:     { label: "Incompleto",  value: "2"},
    completed:      { label: "Completado",  value: "3"},
    cancelled:      { label: "Cancelado",   value: "4"},
}

export const TaskPriority = {
    low:        { label: "Baja",    value: "1"},
    medum:      { label: "Media",   value: "2"},
    high:       { label: "Alta",    value: "3"},
    extreme:    { label: "Extrema", value: "4"}
}

export const ConstObjectToSelectOptionsArray = (object) => {
    let result = []
    Object.keys(object).map((item)=>{
        result.push(object[item])
    })
    return result
}