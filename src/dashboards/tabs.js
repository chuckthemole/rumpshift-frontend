import React from 'react';
import { useState } from 'react';
import ReactDOM from 'react-dom/client';

import Home from './tab_home';
import FlavorPumpDashboard from './flavor_pump';
import PasteurizerDashboard from './pasteurizer_dashboard';
import MachineDashboard from './machine_dashboard';
import MachineTaskManager from './machine_task_manager';
import {
    LOGGER,
    ApiPersistence,
    AdminSiteSettingsDashboard,
    EntityTaskManager
} from '@rumpushub/common-react';
import CounterSessionChart, { SimplifiedLevel } from '../buildshift/analytics/counter_session_chart';

export default function Tabs() {

    const is_active = 'is-active';

    const [homeActive, setHomeActive] = useState(true);
    const [dashboardActive, setDashboardActive] = useState(false);
    const [machineTaskManagerActive, setMachineTaskManagerActive] = useState(false);
    const [settingsActive, setSettingsActive] = useState(false);
    const [analyticsActive, setAnalyticsActive] = useState(false);

    const [activeWindow, setActiveWindow] = useState(<Home />);

    function clear() {
        setHomeActive(false);
        setDashboardActive(false);
        setMachineTaskManagerActive(false);
        setSettingsActive(false);
        setAnalyticsActive(false);
    }

    return (
        <>
            <div className="tabs is-boxed">
                <ul>
                    <li className={homeActive ? 'is-active' : ''}>
                        <a onClick={() => { clear(); setHomeActive(true); setActiveWindow(<Home />); }}>
                            <span>Home</span>
                        </a>
                    </li>
                    <li className={dashboardActive ? 'is-active' : ''}>
                        <a onClick={() => {
                            clear(); setDashboardActive(true); setActiveWindow(
                                <MachineDashboard
                                    persistence={ApiPersistence(
                                        "/api/arduino_consumer/arduino/get-machines/",
                                        "RUMPSHIFT_API"
                                    )}
                                />
                            );
                        }}>
                            <span>Machines</span>
                        </a>
                    </li>
                    <li className={machineTaskManagerActive ? 'is-active' : ''}>
                        <a onClick={() => { clear(); setMachineTaskManagerActive(true); setActiveWindow(<MachineTaskManager />); }}>
                            <span>Machine Task Manager</span>
                        </a>
                    </li>
                    <li className={settingsActive ? 'is-active' : ''}>
                        <a onClick={() => { clear(); setSettingsActive(true); setActiveWindow(<AdminSiteSettingsDashboard />); }}>
                            <span>Site Settings</span>
                        </a>
                    </li>

                    <li className={analyticsActive ? 'is-active' : ''}>
                        <a onClick={() => {
                            clear(); setAnalyticsActive(true); setActiveWindow(
                                <CounterSessionChart
                                    apiUrl="/api/rumpshift-analytics/counter-session-data/"
                                    showControls={true}
                                    simplifiedLevel={SimplifiedLevel.DETAILED} />
                            );
                        }}>
                            <span>Analytics</span>
                        </a>
                    </li>
                </ul>
            </div>
            <div className='is-centered has-background-light box'>{activeWindow}</div>
        </>
    )
}
