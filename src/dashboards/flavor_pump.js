// src/dashboards/FlavorPumpDashboard.js
import React from "react";
import { useState } from "react";

import { DashboardTemplate, ToggleSwitch, Slider, ProgressMeter, ControlButton, LiveValueDisplay, NumberStepper } from "@rumpushub/common-react";

const FlavorPumpDashboard = () => {

    const [speed, setSpeed] = useState(50);
    const [progress, setProgress] = useState(40);
    const [liveValue, setLiveValue] = useState(990);
    const [level, setLevel] = useState(5);

    const layout = [
        [
            { component: <ToggleSwitch label={'anotherthing'} />, colSpan: 6 },
            { component: <Slider label={'thisthing'} value={speed} onChange={setSpeed} />, colSpan: 6 },
        ],
        [
            { component: <ProgressMeter label={'thisprogress'} value={progress} showPercent={true} onChange={setProgress} />, colSpan: 12, rowSpan: 2 },
        ],
        [
            { component: <ControlButton label={'buttonthing'} circular={true} holdToActivate={true} />, colSpan: 4 },
            { component: <LiveValueDisplay label={'thislivevalue'} circular={true} value={liveValue} onChange={setLiveValue} />, colSpan: 4 },
            { component: <NumberStepper label={'numberstepper'} value={level} onChange={setLevel} min={0} max={10} />, colSpan: 4 },
        ],
    ];


    return <DashboardTemplate layout={layout} />;
};

export default FlavorPumpDashboard;
