// apps/rumpus/src/components/NotionTasks.jsx

import React, { useState } from "react";
import { TasksTemplate } from "@rumpushub/common-react";

// Dummy tasks (replace later with data from Notion API)
const dummyTasks = [
    {
        id: "1",
        title: "Finish quarterly report",
        description: "Compile sales data and finalize the Q3 report.",
        assignedTo: { id: "u1", name: "Alice Johnson" },
        completed: false,
    },
    {
        id: "2",
        title: "Update website copy",
        description: "Revise the landing page text for the fall campaign.",
        assignedTo: { id: "u2", name: "Bob Smith" },
        completed: true,
    },
    {
        id: "3",
        title: "Team meeting prep",
        description: "Create agenda and slides for Monday’s sync.",
        assignedTo: { id: "u1", name: "Alice Johnson" },
        completed: false,
    },
    {
        id: "4",
        title: "Customer follow-up",
        description: "Send follow-up emails to leads from the trade show.",
        assignedTo: { id: "u3", name: "Carla Diaz" },
        completed: false,
    },
];

export default function NotionTasks() {
    const [tasks, setTasks] = useState(dummyTasks);

    // Example: Replace with API call to toggle task completion in Notion
    const handleToggleComplete = (taskId, newValue) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === taskId ? { ...t, completed: newValue } : t))
        );
    };

    // Simulate current logged-in user (swap for real auth user later)
    const currentUser = { id: "u1", name: "Alice Johnson" };

    // For now, you can toggle this to test admin vs normal user view
    const isAdmin = true;

    return (
        <div className="section">
            <h1 className="title">Notion Tasks</h1>
            <TasksTemplate
                tasks={tasks}
                currentUser={currentUser}
                isAdmin={isAdmin}
                onToggleComplete={handleToggleComplete}
                layout={"horizontal"}
            />
        </div>
    );
}
