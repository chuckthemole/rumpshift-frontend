import React from "react";
import { EntityTaskManager } from "@rumpushub/common-react";

export default function MachineTaskManager() {
    return (
        <EntityTaskManager
            parentName="Machine"
            childName="Task"
            apiName="RUMPSHIFT_API"
            endpoints={{
                getParents: "/api/arduino_consumer/arduino/get-machines/",
                getChildren: "/api/arduino_consumer/arduino/get-tasks/",
                addParent: "/api/arduino_consumer/arduino/add-machine/",
                removeParent: "/api/arduino_consumer/arduino/remove-machine/",
                updateChild: "/api/arduino_consumer/arduino/task-update/",
            }}

            // Map consumer fields to abstract fields
            formatter={(machine) => machine.alias || "(unnamed)"}
            renderParentExtra={(machine) => (
                <span style={{ marginLeft: "8px" }}>(IP: {machine.ip || "N/A"})</span>
            )}
            renderParentFormFields={(form, setForm) => (
                <div className="control">
                    <input
                        className="input"
                        placeholder="Machine IP"
                        value={form.ip || ""}
                        onChange={(e) => setForm({ ...form, ip: e.target.value })}
                    />
                </div>
            )}

            // Convert abstract fields back to consumer fields for API
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
                if (!machine.ip) {
                    throw new Error("Machine must have IP to update task");
                }
                if (status !== "kill" && (!task.name || !machine.alias)) {
                    throw new Error("Task requires name and machine alias to start or pause");
                }
                return {
                    alias: machine.alias,
                    ip: machine.ip,
                    taskName: task.name,
                    notes: task.notes || "",
                    status,
                };
            }}
        />
    );
}
