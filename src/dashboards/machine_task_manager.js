import React, { useCallback, useMemo } from "react";
import { EntityTaskManager } from "@rumpushub/common-react";

export default function MachineTaskManager() {
    const handleDeleteMachines = async (forceClean) => {
        try {
            const res = await fetch("/api/arduino_consumer/arduino/delete-machines/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ force_clean: forceClean }),
            });
            const data = await res.json();
            alert(data.message || "Delete request completed");
        } catch (err) {
            console.error(err);
            alert("Failed to delete machines");
        }
    };

    // Memoize endpoints so the object reference is stable
    const endpoints = useMemo(() => ({
        getParents: "/api/arduino_consumer/arduino/get-machines/",
        getChildren: "/api/arduino_consumer/arduino/get-tasks/",
        addParent: "/api/arduino_consumer/arduino/add-machine/",
        removeParent: "/api/arduino_consumer/arduino/remove-machine/",
        updateChild: "/api/arduino_consumer/arduino/task-update/",
    }), []);

    // Memoize formatter
    const formatter = useCallback(
        (machine) => machine.name || machine.alias || "(unnamed)",
        []
    );

    // Memoize getParentId so the effect in EntityTaskManager is stable
    const getParentId = useCallback((p) => p.id, []);

    return (
        <>
            <EntityTaskManager
                parentName="Machine"
                childName="Task"
                apiName="RUMPSHIFT_API"
                endpoints={endpoints} // memoized object
                getParentId={getParentId} // memoized function
                parentNameField="name"
                childNameField="name"
                formatter={formatter}
                renderParentFormFields={(form, setForm) => (
                    <>
                        <div className="control">
                            <input
                                className="input"
                                placeholder="Machine Name"
                                value={form.name || ""}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                            />
                        </div>
                        <div className="control">
                            <input
                                className="input"
                                placeholder="Machine IP"
                                value={form.ip || ""}
                                onChange={(e) => setForm({ ...form, ip: e.target.value })}
                            />
                        </div>
                    </>
                )}
                renderParentExtra={(machine) => (
                    <span style={{ marginLeft: "8px" }}>(IP: {machine.ip || "N/A"})</span>
                )}
                formatParentPayload={(machine) => {
                    if (!machine.name || !machine.ip) {
                        throw new Error("Machine must have a name and IP to send to backend");
                    }
                    return {
                        alias: machine.name,
                        ip: machine.ip,
                    };
                }}
                formatChildPayload={(machine, task, status) => {
                    const alias = machine.alias || machine.name;
                    if (!alias) {
                        throw new Error("Machine must have alias or name to update task");
                    }
                    if (status !== "kill" && !task.name) {
                        throw new Error("Task requires name to start or pause");
                    }
                    return {
                        alias,
                        ip: machine.ip,
                        taskName: task.name,
                        notes: task.notes || "",
                        status,
                    };
                }}
            />

            {/* Extra buttons for machine cleanup */}
            <div style={{ marginTop: "16px" }}>
                <button
                    className="button is-warning"
                    onClick={() => handleDeleteMachines(false)}
                >
                    Delete Idle Machines
                </button>
                <button
                    className="button is-danger"
                    style={{ marginLeft: "8px" }}
                    onClick={() => handleDeleteMachines(true)}
                >
                    Force Delete All Machines
                </button>
            </div>
        </>
    );
}
