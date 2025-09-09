import React, { useState } from "react";

import {
    DashboardTemplate,
    ToggleSwitch,
    Slider,
    ProgressMeter,
    ControlButtonCartoon,
    ControlButtonBox,
    LiveValueDisplay,
    NumberStepper,
    LOGGER,
    debugComponents
} from "@rumpushub/common-react";

debugComponents(
    {
        DashboardTemplate,
        ToggleSwitch,
        Slider,
        ProgressMeter,
        ControlButtonCartoon,
        ControlButtonBox,
        LiveValueDisplay,
        NumberStepper,
    },
    "FlavorPumpDashboard"
);

const FlavorPumpDashboard = () => {
    const [speed, setSpeed] = useState(50);
    const [progress, setProgress] = useState(40);
    const [liveValue, setLiveValue] = useState(990);
    const [level, setLevel] = useState(5);

    // Bail early if required component is missing
    if (!DashboardTemplate) {
        return (
            <div style={{ color: "red" }}>
                Error: DashboardTemplate is not available. Check your imports from
                @rumpushub/common-react.
            </div>
        );
    }

    const layout = [
        [
            { component: ToggleSwitch ? <ToggleSwitch label="anotherthing" /> : <div>ToggleSwitch missing</div>, colSpan: 6 },
            { component: Slider ? <Slider label="thisthing" value={speed} onChange={setSpeed} /> : <div>Slider missing</div>, colSpan: 6 },
        ],
        [
            { component: ProgressMeter ? <ProgressMeter label="thisprogress" value={progress} showPercent={true} onChange={setProgress} /> : <div>ProgressMeter missing</div>, colSpan: 12, rowSpan: 2 },
        ],
        [
            {
                component: ControlButtonBox ? (
                    <ControlButtonBox
                        label="Cartoon Button"
                        ButtonComponent={ControlButtonCartoon}
                        circular
                        holdToActivate
                        tooltip="custom tooltip"
                    />
                ) : <div>ControlButtonBox missing</div>,
                colSpan: 4
            },
            { component: LiveValueDisplay ? <LiveValueDisplay label="thislivevalue" circular value={liveValue} onChange={setLiveValue} /> : <div>LiveValueDisplay missing</div>, colSpan: 4 },
            { component: NumberStepper ? <NumberStepper label="numberstepper" value={level} onChange={setLevel} min={0} max={10} /> : <div>NumberStepper missing</div>, colSpan: 4 },
        ],
    ];

    return <DashboardTemplate layout={layout} />;
};

export default FlavorPumpDashboard;
