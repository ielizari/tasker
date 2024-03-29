import { Job} from '../../domain/job'
import { ISOStringToFormatedDate } from '../../../lib/date.utils'

export const mapApiJobToComponent = (job: Job): Job => {
    if(!job){
        return null
    }
    const dates = {
        //createdDate: formattedDateToISOString(worklog.createdDate),
        startDatetime: ISOStringToFormatedDate(job.startDatetime),
        endDatetime: ISOStringToFormatedDate(job.endDatetime)
    }
    return {
        ...job, 
        ...dates
    }
}