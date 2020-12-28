import { WorklogDB, Worklog } from '../../domain/worklog'
import { formattedDateToISOString, ISOStringToFormatedDate } from '../../../lib/date.utils'


export const mapWorklogToApiWorklog = (worklog: WorklogDB): Worklog => {
    if(!worklog){
        return null
    }
    const dates = {
        startDatetime: ISOStringToFormatedDate(worklog.startDatetime),
        endDatetime: ISOStringToFormatedDate(worklog.endDatetime)
    }
    return {
        ...worklog, 
        ...dates
    }
}

export const mapApiWorklogToWorklogDb = (worklog: Worklog): WorklogDB => {
    console.log(worklog)
    const dates = {
        startDatetime: formattedDateToISOString(worklog.startDatetime),
        endDatetime: formattedDateToISOString(worklog.endDatetime)
    }
    return {
        ...worklog, 
        ...dates
    }
}
