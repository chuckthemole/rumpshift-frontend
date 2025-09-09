import React, { useState } from "react";
import { TasksTemplate, ToggleSwitch, ControlButtonRetro } from "@rumpushub/common-react";

// Dummy tasks (replace later with data from Notion API)
const dummyTasks = [
    { id: "1", title: "Finish quarterly report", description: "Compile sales data and finalize the Q3 report.", assignedTo: { id: "u1", name: "Alice Johnson" }, completed: false },
    { id: "2", title: "Update website copy", description: "Revise the landing page text for the fall campaign.", assignedTo: { id: "u2", name: "Bob Smith" }, completed: true },
    { id: "3", title: "Team meeting prep", description: "Create agenda and slides for Monday’s sync.", assignedTo: { id: "u1", name: "Alice Johnson" }, completed: false },
    { id: "4", title: "Customer follow-up", description: "Send follow-up emails to leads from the trade show.", assignedTo: { id: "u3", name: "Carla Diaz" }, completed: false },
];

export default function NotionTasks() {
    const [tasks, setTasks] = useState(dummyTasks);

    const currentUser = { id: "u1", name: "Alice Johnson" };
    const isAdmin = true;

    return (
        <div className="section">
            <h1 className="title">Notion Tasks</h1>
            <TasksTemplate
                tasks={tasks}
                currentUser={currentUser}
                isAdmin={isAdmin}
                layout="horizontal"
                onTasksChange={setTasks} // keeps top-level state in sync
                allowReopen={true}
                taskUiElements={(task) => [
                    {
                        component: ControlButtonRetro,
                        props: { label: "Disable Task" },
                        action: TasksTemplate.builtInActions.toggleComplete,
                    },
                    {
                        props: { label: "Highlight Task" },
                        action: TasksTemplate.builtInActions.highlight,
                    },
                    {
                        props: { label: "Delete Task" },
                        action: TasksTemplate.builtInActions.deleteTask,
                    }
                ]}
            />
        </div>
    );
}
