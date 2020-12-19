import  {Datepicker}  from './orzkDatepicker/datepicker'

export const dateToString = (d: Date, dateFormat: string = 'dmy/', timeFormat : string = 'hm') : string => {
    let dp = new Datepicker(null,null,{lang: 'es',dateFormat: dateFormat, timeFormat: timeFormat});
    dp.setDate(d);
    return dp.getFullDateString()
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
    if(datetime.length == 2){
        let date = datetime[0]
        let time = datetime[1]
        if(isValidDate(date) && isValidTime(time)){
            return true
        }
    }
    return false
}