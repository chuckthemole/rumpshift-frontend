import * as React from 'react';
import { Outlet } from 'react-router-dom';

import { Footer, Header, Section, RumpusQuillForm, RumpusQuill, AuthRoot, FontSwitcher } from '@rumpushub/common-react'

export default function App() {

    console.log('rumpus React version:', React.version);

    return (
        <>
            <AuthRoot>
                <Header header_path={'/view/header'} />
                <div className='columns is-centered'>
                    <div className='column'></div>
                    <div className='column is-three-fifths'>
                        <FontSwitcher />
                        <Outlet />
                    </div>
                    <div className='column'></div>
                </div>
                <Footer footer_path={"/view/footer"} />
            </AuthRoot>
        </>
    )
}