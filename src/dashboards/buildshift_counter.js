import React, { useState, useEffect } from "react";
import { getNamedApi } from "@rumpushub/common-react";

export default function BuildshiftCounter() {
    const [machines, setMachines] = useState([]);
    const [machineForm, setMachineForm] = useState({ ip: "", alias: "" });
    const [editingIndex, setEditingIndex] = useState(null);

    const [showModal, setShowModal] = useState(false);
    const [taskForm, setTaskForm] = useState({ taskName: "", notes: "" });
    const [activeMachineIndex, setActiveMachineIndex] = useState(null);
    const [expandedIndex, setExpandedIndex] = useState(null);

    // --- Load machines and their current tasks ---
    useEffect(() => {
        async function fetchMachinesWithTasks() {
            try {
                const api = getNamedApi('RUMPSHIFT_API');

                // Fetch machines and tasks in parallel using the API client
                const [machinesResp, tasksResp] = await Promise.all([
                    api.get("/api/arduino_consumer/arduino/get-machines/"),
                    api.get("/api/arduino_consumer/arduino/get-tasks/")
                ]);

                const machinesData = machinesResp.data;
                const tasksData = tasksResp.data;

                // Map tasks into machines
                const machinesWithTasks = machinesData.map(machine => {
                    const task = tasksData.find(t => t.ip === machine.ip) || null;
                    return { ...machine, task };
                });

                setMachines(machinesWithTasks);
            } catch (err) {
                console.error("Error fetching machines or tasks:", err);
            }
        }

        fetchMachinesWithTasks();
    }, []);



    // --- Add/Edit Machine locally ---
    async function saveMachine() {
        if (!machineForm.ip || !machineForm.alias) return;

        if (editingIndex !== null) {
            // Editing existing machine locally
            const updated = [...machines];
            updated[editingIndex] = { ...updated[editingIndex], ...machineForm };
            setMachines(updated);
            setEditingIndex(null);

            // Optional: Update alias in backend if you want
            try {
                await fetch("http://localhost:8000/api/arduino_consumer/arduino/add-machine/", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(machineForm),
                });
            } catch (err) {
                console.error("Error updating machine:", err);
            }

        } else {
            // Adding a new machine
            try {
                const response = await fetch(
                    "http://localhost:8000/api/arduino_consumer/arduino/add-machine/",
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(machineForm),
                    }
                );

                if (!response.ok) throw new Error(response.statusText);

                const newMachine = { ...machineForm, task: null }; // initialize with no task
                setMachines([...machines, newMachine]);
            } catch (err) {
                console.error("Error adding machine:", err);
            }
        }

        setMachineForm({ ip: "", alias: "" });
    }

    function editMachine(index) {
        setMachineForm(machines[index]);
        setEditingIndex(index);
    }

    // --- Remove Machine ---
    async function removeMachine(index) {
        const machineToRemove = machines[index];

        // Check if there is a task running or paused
        if (machineToRemove.task?.status && machineToRemove.task.status !== "idle") {
            alert("Cannot remove machine with active task. Kill or pause task first.");
            return;
        }

        try {
            const response = await fetch(
                "http://localhost:8000/api/arduino_consumer/arduino/remove-machine/",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ ip: machineToRemove.ip }),
                }
            );
            if (!response.ok) throw new Error(response.statusText);

            setMachines(machines.filter((_, i) => i !== index));
        } catch (err) {
            console.error("Error removing machine:", err);
        }
    }


    // --- Task Controls ---
    async function sendTaskUpdate(machine, status) {
        const payload = {
            ip: machine.ip,
            alias: machine.alias,
            taskName: machine.taskName,
            notes: machine.notes,
            status,
            timestamp: new Date().toISOString(),
        };

        try {
            const response = await fetch(
                "http://localhost:8000/api/arduino_consumer/arduino/task-update/",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload),
                }
            );
            if (!response.ok) throw new Error(response.statusText);
        } catch (err) {
            console.error("Error sending task update:", err);
        }
    }

    function startTask(index, taskName, notes) {
        const updated = [...machines];
        updated[index].task = { taskName, notes, status: "running" }; // ✅ nested task
        setMachines(updated);
        setShowModal(false);

        sendTaskUpdate({ ...updated[index], ...updated[index].task }, "running");
    }

    function pauseTask(index) {
        const updated = [...machines];
        if (updated[index].task) {
            updated[index].task.status = "paused";
            setMachines(updated);

            sendTaskUpdate({ ...updated[index], ...updated[index].task }, "paused");
        }
    }

    function killTask(index) {
        const updated = [...machines];
        if (updated[index].task) {
            const taskToKill = { ...updated[index], ...updated[index].task }; // send old task info
            updated[index].task = null; // remove task from machine
            setMachines(updated);

            sendTaskUpdate(taskToKill, "kill");
        }
    }

    return (
        <div>
            <h2 className="title is-4">Buildshift Counter</h2>

            {/* --- Machine List --- */}
            <ul className="machine-list">
                {machines.map((m, i) => {
                    const taskStatus = m.task?.status || "idle";
                    const taskName = m.task?.taskName || "";
                    const hasNotes = m.task?.notes && m.task.notes.trim() !== "";

                    return (
                        <li
                            key={m.ip}
                            style={{ borderBottom: "1px solid #ddd" }}
                        >
                            <div
                                className="p-2 is-flex is-justify-content-space-between is-align-items-center"
                                onClick={() => {
                                    if (hasNotes) {
                                        setExpandedIndex(expandedIndex === i ? null : i);
                                    }
                                }}
                                style={{ cursor: hasNotes ? "pointer" : "default" }}
                            >
                                <div>
                                    <strong>Machine:</strong> {m.alias} ({m.ip}) <br />
                                    <strong>Task:</strong>{" "}
                                    {taskName ? `${taskName} (${taskStatus})` : "No active task"}
                                    {hasNotes && (
                                        <span style={{ fontStyle: "italic", marginLeft: 8 }}>
                                            (click to view notes)
                                        </span>
                                    )}
                                </div>
                                <div>
                                    {taskStatus === "idle" && (
                                        <button
                                            className="button is-small is-success mr-2"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setActiveMachineIndex(i);
                                                setTaskForm({ taskName: "", notes: "" });
                                                setShowModal(true);
                                            }}
                                        >
                                            Run
                                        </button>
                                    )}
                                    {taskStatus === "running" && (
                                        <>
                                            <button
                                                className="button is-small is-warning mr-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    pauseTask(i);
                                                }}
                                            >
                                                Pause
                                            </button>
                                            <button
                                                className="button is-small is-danger mr-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    killTask(i);
                                                }}
                                            >
                                                Kill
                                            </button>
                                        </>
                                    )}
                                    {taskStatus === "paused" && (
                                        <>
                                            <button
                                                className="button is-small is-success mr-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    startTask(i, taskName, m.task.notes);
                                                }}
                                            >
                                                Resume
                                            </button>
                                            <button
                                                className="button is-small is-danger mr-2"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    killTask(i);
                                                }}
                                            >
                                                Kill
                                            </button>
                                        </>
                                    )}

                                    <button
                                        className="button is-small is-info mr-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            editMachine(i);
                                        }}
                                    >
                                        Edit
                                    </button>

                                    <button
                                        className="button is-small is-danger"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            removeMachine(i);
                                        }}
                                        disabled={taskStatus !== "idle"}
                                        title={taskStatus !== "idle" ? "Cannot remove machine with active task" : ""}
                                    >
                                        Remove
                                    </button>
                                </div>
                            </div>

                            {/* Expanded Notes */}
                            {expandedIndex === i && hasNotes && (
                                <div style={{ padding: "0.5rem 1rem", background: "#f9f9f9", fontStyle: "italic" }}>
                                    Notes: {m.task.notes}
                                </div>
                            )}
                        </li>
                    );
                })}
            </ul>

            {/* --- Add/Edit Machine Form --- */}
            <div className="box mt-3">
                <h3 className="subtitle is-6">Add / Edit Machine</h3>
                <div className="field is-grouped">
                    <div className="control">
                        <input
                            className="input"
                            type="text"
                            placeholder="Device IP"
                            value={machineForm.ip}
                            onChange={(e) =>
                                setMachineForm({ ...machineForm, ip: e.target.value })
                            }
                        />
                    </div>
                    <div className="control">
                        <input
                            className="input"
                            type="text"
                            placeholder="Alias"
                            value={machineForm.alias}
                            onChange={(e) =>
                                setMachineForm({ ...machineForm, alias: e.target.value })
                            }
                        />
                    </div>
                    <div className="control">
                        <button className="button is-info" onClick={saveMachine}>
                            {editingIndex !== null ? "Update" : "Add"}
                        </button>
                    </div>
                    {editingIndex !== null && (
                        <div className="control">
                            <button
                                className="button is-light"
                                onClick={() => {
                                    setMachineForm({ ip: "", alias: "" });
                                    setEditingIndex(null);
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    )}
                </div>
            </div>


            {/* --- Task Modal --- */}
            {showModal && (
                <div className="modal is-active">
                    <div
                        className="modal-background"
                        onClick={() => setShowModal(false)}
                    ></div>
                    <div className="modal-card">
                        <header className="modal-card-head">
                            <p className="modal-card-title">Start Task</p>
                            <button
                                className="delete"
                                aria-label="close"
                                onClick={() => setShowModal(false)}
                            ></button>
                        </header>
                        <section className="modal-card-body">
                            <div className="field">
                                <label className="label">Task Name</label>
                                <div className="control">
                                    <input
                                        className="input"
                                        type="text"
                                        placeholder="Enter task name"
                                        value={taskForm.taskName}
                                        onChange={(e) =>
                                            setTaskForm({ ...taskForm, taskName: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <label className="label">Notes</label>
                                <div className="control">
                                    <textarea
                                        className="textarea"
                                        placeholder="Optional notes"
                                        value={taskForm.notes}
                                        onChange={(e) =>
                                            setTaskForm({ ...taskForm, notes: e.target.value })
                                        }
                                    />
                                </div>
                            </div>
                        </section>
                        <footer className="modal-card-foot">
                            <button
                                className="button is-success"
                                onClick={() =>
                                    startTask(activeMachineIndex, taskForm.taskName, taskForm.notes)
                                }
                                disabled={!taskForm.taskName}
                            >
                                Start
                            </button>
                            <button
                                className="button"
                                onClick={() => setShowModal(false)}
                            >
                                Cancel
                            </button>
                        </footer>
                    </div>
                </div>
            )}
        </div>
    );
}
