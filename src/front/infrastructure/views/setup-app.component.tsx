import React from 'react'

import { LoadDB } from '../components/loaddb.component'
import { Head, LinkLogo, LogoBox, LogoImg} from '../components/common/header'

export const SetupApp = ( props ) => {
    return (
        <>
            <Head>                
                <LogoBox>
                    <LinkLogo to="/">
                        <LogoImg/>
                        Tasker Setup
                    </LinkLogo>
                 </LogoBox>                
            </Head>
            <LoadDB />
        </>
    )
}


