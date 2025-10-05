/**
 * 🔧 Dummy task data for development and testing.
 * These tasks are hardcoded and do not come from any API or database.
 * Replace or remove once real backend integration is available.
 */
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

export default dummyTasks;
