import  {Datepicker}  from './orzkDatepicker/datepicker'

export const dateToString = (d: Date, dateFormat: string = 'dmy/', timeFormat : string = 'hm') : string => {
    let dp = new Datepicker(null,null,{lang: 'es',dateFormat: dateFormat, timeFormat: timeFormat});
    dp.setDate(d);
    return dp.getFullDateString()
}