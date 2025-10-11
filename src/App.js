import React, { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import {
    Footer,
    Header,
    Section,
    RumpusQuillForm,
    RumpusQuill,
    AuthRoot,
    useColorSettings,
    LayoutSettingsProvider,
    useLayoutSettings
} from '@rumpushub/common-react';

import NotionConsoleButton from './buildshift/buttons/notion_console_button';
import LeaderboardButton from './buildshift/buttons/leaderboard_button';

export default function App() {
    const { initColors } = useColorSettings();

    useEffect(() => {
        initColors();
    }, []);

    return (
        <LayoutSettingsProvider>
            <div className="app-container">
                <AuthRoot className="app-inner">
                    <Header
                        header_path={"/view_bs/header"}
                    // navbarItemsEnd={[<NotionConsoleButton />, <LeaderboardButton />]}
                    />

                    <main className="app-content columns is-centered">
                        <div className="column"></div>
                        <LayoutContent />
                        <div className="column"></div>
                    </main>

                    <Footer footer_path={"/view_bs/footer"} />
                </AuthRoot>
            </div>
        </LayoutSettingsProvider>
    );
}

// Separate component to consume layout context for main content
function LayoutContent() {
    const { layout } = useLayoutSettings();

    return (
        <div className={`column ${layout.columnWidth}`}>
            <Outlet />
        </div>
    );
}
