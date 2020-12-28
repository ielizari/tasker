import { WorklogDB, Worklog } from '../../domain/worklog'
import { formattedDateToISOString, ISOStringToFormatedDate } from '../../../lib/date.utils'


export const mapWorklogToApiWorklog = (worklog: WorklogDB): Worklog => {
    if(!worklog){
        return null
    }
    const dates = {
        createdDate: ISOStringToFormatedDate(worklog.createdDate),
        startDatetime: ISOStringToFormatedDate(worklog.startDatetime),
        endDatetime: ISOStringToFormatedDate(worklog.endDatetime)
    }
    return {
        ...worklog, 
        ...dates
    }
}

export const mapApiWorklogToWorklogDb = (worklog: Worklog): WorklogDB => {
    const dates = {
        createdDate: formattedDateToISOString(worklog.createdDate),
        startDatetime: formattedDateToISOString(worklog.startDatetime),
        endDatetime: formattedDateToISOString(worklog.endDatetime)
    }
    return {
        ...worklog, 
        ...dates
    }
}
