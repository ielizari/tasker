import  {Datepicker}  from './orzkDatepicker/datepicker'

export const dateToFormattedDate = (d: Date, dateFormat: string = 'dmy/', timeFormat : string = 'hm') : string => {
    try{
        let dp = new Datepicker(null,null,{lang: 'es',dateFormat: dateFormat, timeFormat: timeFormat})
        dp.setDate(d);
        return dp.getFullDateString()
    }catch(e){
        console.log(e)
        return ''
    }
}

export const formattedDateToDate = (d: string, dateFormat: string = 'dmy/', timeFormat : string = 'hm'): Date => {
    try {
        let dp = new Datepicker(null,null,{lang: 'es',dateFormat: dateFormat, timeFormat: timeFormat})
        return dp.createDate(d) as Date
    }catch(e){
        throw e
    }
}

export const ISOStringToFormatedDate = (d: string, dateFormat: string = 'dmy/', timeFormat : string = 'hm'): string => {
    try{
        if(d.length > 0){
            let dp : Datepicker = new Datepicker(null,null,{lang:'es', dateFormat: dateFormat, timeFormat: timeFormat})
            dp.setDate(new Date(Date.parse(d)))
            return dp.getFullDateString()
        }else{
            return ''
        }
    }catch(e){
        throw e
    }
}
export const formattedDateToISOString = (d: string, dateFormat: string = 'dmy/', timeFormat : string = 'hm'): string => {
    try{
        if(d.length > 0){
            let date = (new Datepicker(null,null,{lang:'es', dateFormat: dateFormat, timeFormat: timeFormat})).createDate(d)
            if(date){
                return (date as Date).toISOString()
            }else{
                throw new Error(`La fecha ${d} tiene un formato no válido.`)
            }            
        }else{
            return ''
        }
    }catch(e){
        throw e
    }
}

export const isValidDate = (date: string): boolean => {
    if(
        date.match(/^(((0[1-9]|[12]\d|3[01])\/(0[13578]|1[02])\/((19|[2-9]\d)\d{2}))|((0[1-9]|[12]\d|30)\/(0[13456789]|1[012])\/((19|[2-9]\d)\d{2}))|((0[1-9]|1\d|2[0-8])\/02\/((19|[2-9]\d)\d{2}))|(29\/02\/((1[6-9]|[2-9]\d)(0[48]|[2468][048]|[13579][26])|(([1][26]|[2468][048]|[3579][26])00))))$/g)
    ){
        return true
    }else{
        return false
    }
}

export const isValidTime = (time: string) : boolean => {
    if(time.match(/^([0-1]?[0-9]|[2][0-3]):([0-5][0-9])(:[0-5][0-9])?$/)){
        return true
    }else{
        return false
    }
}

export const isValidDateTime = (input: string): boolean => {
    let datetime = input.split(" ")
    if(datetime.length === 2){
        let date = datetime[0]
        let time = datetime[1]
        if(isValidDate(date) && isValidTime(time)){
            return true
        }
    }
    return false
}

export const elapsedTime = ( from: string, to: string): number => {
    let t0 = formattedDateToDate(from,'dmy/','hms')
    let t1 = formattedDateToDate(to,'dmy/','hms')
    let diff: number = (t1.getTime() - t0.getTime())

    return diff
}

export const formatElapsedTimeFromSeconds = (seconds: number) : string => {
    return formatElapsedTime(seconds*1000)
}

export const formatElapsedTime = (seconds: number) : string => {
    let absSeconds = Math.abs(seconds)
    let hora = Math.floor(absSeconds/3600000)
	let resto = absSeconds%3600000
	let minuto = Math.floor(resto / 60000)
	resto = resto%60000
	let segundo = resto / 1000
	resto = resto % 1000
    
    let timeString = padNumber(hora) + ":" + padNumber(minuto) + ":" + padNumber(segundo)
    if(seconds < 0){
        timeString = "-"+timeString
    }
    return timeString
}

export const padNumber = (num: number): string => {
    let res = num.toString()
    if(num < 10){
        res = '0'+res
    }

    return res
}