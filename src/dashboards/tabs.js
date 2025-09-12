const React = require('react');
const ReactDOM = require('react-dom/client');

import Home from './tab_home';
import FlavorPumpDashboard from './flavor_pump';
import BuildshiftCounter from './buildshift_counter'; // import the new component

export default function Tabs() {

    const is_active = 'is-active';

    const [homeActive, setHome] = React.useState(true);
    const [dashboardActive, setDashboard] = React.useState(false);
    const [buildshiftActive, setBuildshift] = React.useState(false);

    const [activeWindow, setActiveWindow] = React.useState(<Home />);

    function clear() {
        setHome(false);
        setDashboard(false);
        setBuildshift(false);
    }

    return (
        <>
            <div className="tabs is-boxed">
                <ul>
                    <li className={`homeTab ${homeActive && is_active}`}>
                        <a onClick={() => { clear(); setHome(true); setActiveWindow(<Home />); }}>
                            <span>Home</span>
                        </a>
                    </li>
                    <li className={`dashboardTab ${dashboardActive && is_active}`}>
                        <a onClick={() => { clear(); setDashboard(true); setActiveWindow(<FlavorPumpDashboard />); }}>
                            <span>Flavor Pump</span>
                        </a>
                    </li>
                    <li className={`buildshiftTab ${buildshiftActive && is_active}`}>
                        <a onClick={() => { clear(); setBuildshift(true); setActiveWindow(<BuildshiftCounter />); }}>
                            <span>Buildshift Counter</span>
                        </a>
                    </li>
                </ul>
            </div>

            <div className='is-centered has-background-light box'>{activeWindow}</div>
        </>
    )
}
