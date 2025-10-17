import React, { useState, useEffect } from "react";
import {
    LOGGER,
    LocalPersistence,
    SingleSelector
} from "@rumpushub/common-react";
import MachineJsonEditor from "../buildshift/machine_json_editor";

/**
 * MachineDetailsView component.
 * Displays detailed information for a selected machine.
 */
function MachineDetailsView({ machine }) {
    if (!machine) return <div>Select a machine to view its dashboard.</div>;

    return (
        <div className="has-background-light p-4 mb-4">
            <h3 className="title is-5">Machine: {machine.alias}</h3>
            <p><strong>ID:</strong> {machine.id}</p>

            {machine.time && (
                <div>
                    <p><strong>Created At:</strong> {new Date(machine.time.created_at).toLocaleString()}</p>
                    <p><strong>Last Updated:</strong> {new Date(machine.time.update_at).toLocaleString()}</p>
                </div>
            )}

            {machine.tasks && machine.tasks.length > 0 ? (
                <div>
                    <strong>Tasks:</strong>
                    <ul>
                        {machine.tasks.map((task, idx) => (
                            <li key={idx}>{task.name ?? JSON.stringify(task)}</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>No tasks assigned.</p>
            )}
        </div>
    );
}

/**
 * MachineDashboard component.
 * Allows selection of a machine and renders machine-specific dashboards.
 */
export default function MachineDashboard({ persistence = LocalPersistence }) {
    const [machines, setMachines] = useState([]);
    const [selectedMachineId, setSelectedMachineId] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadMachines = async () => {
            try {
                let allMachines = [];

                if (typeof persistence.getAll === "function") {
                    const result = persistence.getAll();
                    allMachines = result instanceof Promise ? await result : result;
                } else {
                    LOGGER.warn(
                        "MachineDashboard: persistence does not support getAll(), defaulting to empty array"
                    );
                }

                setMachines(allMachines);
                if (allMachines.length > 0) setSelectedMachineId(allMachines[0].id);
                LOGGER.debug("MachineDashboard: Loaded machines", allMachines);
            } catch (err) {
                LOGGER.error("MachineDashboard: Error loading machines", err);
                setError("Failed to load machines.");
            }
        };

        loadMachines();
    }, [persistence]);

    const selectedMachine = machines.find((m) => m.id === selectedMachineId) || null;

    const machineOptions = machines.map((m) => ({
        value: m.id,
        label: m.alias,
    }));

    // Render machine-specific dashboard
    const renderMachineDashboard = (machine) => {
        if (!machine) return null;

        // render the generic MachineJsonEditor for any machine
        return <MachineJsonEditor machine_id={machine.id} title={'Wakeup JSON Editor'} />;

        /*
        // if we want to bring back specific dashboards, just uncomment this:
        switch (machine.alias?.toLowerCase()) {
            case "flavor-pump":
                return <FlavorPumpDashboard machine={machine} />;
            case "pasteurizer":
                return <PasteurizerDashboard machine={machine} />;
            default:
                return <MachineJsonEditor machine_id={machine.id} />;
        }
        */
    };

    return (
        <div className="columns">
            {/* Sidebar with SingleSelector */}
            <div className="column is-one-quarter p-3">
                <h2 className="title is-4">Machines</h2>
                {error && <div className="notification is-danger is-light">{error}</div>}

                <SingleSelector
                    options={machineOptions}
                    value={selectedMachineId}
                    onChange={setSelectedMachineId}
                    placeholder="Select a machine..."
                    searchable
                />
            </div>

            {/* Main dashboard */}
            <div className="column p-5">
                <MachineDetailsView machine={selectedMachine} />

                {/* Render specialized dashboard for selected machine */}
                {renderMachineDashboard(selectedMachine)}
            </div>
        </div>
    );
}
