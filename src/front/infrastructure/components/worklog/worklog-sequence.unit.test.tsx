import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from 'react-dom/test-utils'

import {ISOStringToFormatedDate} from '../../../../lib/date.utils'
import {WorklogSequence } from './worklog-sequence.component'
import { WorklogObject, Worklog } from '../../../domain/worklog'

it.only("Muestra mensaje 'No hay trabajos creados' cuando se muestra un parte sin trabajos", async () => {
    const worklog: Worklog = {            
        id:"1",
        createdDate: "05/11/2020 08:00",
        startDatetime:"05/11/2020 09:00",
        endDatetime:"05/11/2020 16:30",
        title:"Compra 05-11-20",
        tags: []
    }
    const worklogObject : WorklogObject= {
        worklog: worklog,
        childJobs: []
    }
    render(
        <WorklogSequence 
            worklog={worklogObject}
        />
    )

    expect(await screen.findByText("No hay trabajos creados")).toBeInTheDocument()
})