import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    TasksTemplate,
    ControlButtonRetro,
    LOGGER,
    ApiPersistence,
    TaskFilterMenu
} from "@rumpushub/common-react";
import dummyTasks from "./test_data/test_notion_tasks";
import { parseNotionTasks } from "./utils";

/**
 * NotionTasks Component
 * ---------------------
 * Fetches and displays tasks from the Notion integration API.
 * Features:
 * - Infinite scroll pagination
 * - Optional task control buttons
 * - Filtering by assigned users, completion status, and sorting by date (toggle)
 *
 * @param {Object} props
 * @param {boolean} [props.showTaskButtons=false] - Show task action buttons
 */
export default function NotionTasks({ showTaskButtons = false }) {
    /** ----------------------------
     * State & Constants
     * ---------------------------- */
    const [allTasks, setAllTasks] = useState([]);
    const [visibleTasks, setVisibleTasks] = useState([]);
    const [page, setPage] = useState(1);
    const [filters, setFilters] = useState({
        selectedUsers: [],
        showCompleted: true,
        sortOrder: "desc", // "asc" or "desc"
        status: "", // not started, in progress, etc

    });
    const loaderRef = useRef(null);
    const PAGE_SIZE = 10;

    /** ----------------------------
     * API Setup
     * ---------------------------- */
    const notionTasksPersistence = ApiPersistence(
        "/notion-api/integrations/notion/projectManagementIntegration/database"
    );

    /** ----------------------------
     * Fetch tasks on mount
     * ---------------------------- */
    useEffect(() => {
        const fetchTasks = async () => {
            try {
                const data = await notionTasksPersistence.getAll({ params: { name: "tasks" } });
                const parsed = parseNotionTasks(data);
                LOGGER.debug(data);
                setAllTasks(parsed);
                setVisibleTasks(parsed.slice(0, PAGE_SIZE));
            } catch (err) {
                LOGGER.group("Notion fetchTasks error");
                LOGGER.error(err);
                LOGGER.groupEnd();
                // Fallback to dummy data
                setAllTasks(dummyTasks);
                setVisibleTasks(dummyTasks.slice(0, PAGE_SIZE));
            }
        };
        fetchTasks();
    }, [notionTasksPersistence]);

    /** ----------------------------
     * Filtered + sorted tasks logic
     * ---------------------------- */
    const getFilteredTasks = useCallback(() => {
        let tasks = [...allTasks];

        // Filter by selected users
        if (filters.selectedUsers.length > 0) {
            tasks = tasks.filter((t) =>
                t.assignedTo?.some((u) => filters.selectedUsers.includes(u.id))
            );
        }

        // Filter completed tasks
        if (!filters.showCompleted) {
            tasks = tasks.filter((t) => !t.completed);
        }

        // Filter by status
        if (filters.status) {
            tasks = tasks.filter((t) => t.status === filters.status);
        }


        // Sort by due date using toggle
        tasks.sort((a, b) => {
            const dateA = new Date(a.dueDate).getTime() || 0;
            const dateB = new Date(b.dueDate).getTime() || 0;
            return filters.sortOrder === "asc" ? dateA - dateB : dateB - dateA;
        });

        return tasks;
    }, [allTasks, filters]);

    /** ----------------------------
     * Update visible tasks on filter or page change
     * ---------------------------- */
    useEffect(() => {
        const filtered = getFilteredTasks();
        setVisibleTasks(filtered.slice(0, page * PAGE_SIZE));
    }, [getFilteredTasks, page]);

    /** ----------------------------
     * Infinite scroll logic
     * ---------------------------- */
    const loadMore = useCallback(() => {
        setPage((prev) => prev + 1);
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { threshold: 1.0 }
        );

        const currentRef = loaderRef.current;
        if (currentRef) observer.observe(currentRef);

        return () => {
            if (currentRef) observer.unobserve(currentRef);
        };
    }, [loadMore]);

    /** ----------------------------
     * Current user & admin
     * ---------------------------- */
    const currentUser = { id: "u1", name: "Alice Johnson" };
    const isAdmin = true;

    /** ----------------------------
     * Task action buttons
     * ---------------------------- */
    const taskUiElements = showTaskButtons
        ? (task) => [
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
            },
        ]
        : undefined;

    /** ----------------------------
     * User options for filter menu
     * ---------------------------- */
    const userOptions = Array.from(
        new Set(allTasks.flatMap((t) => t.assignedTo || []).map((u) => u.id))
    ).map((id) => {
        const user = allTasks.flatMap((t) => t.assignedTo || []).find((u) => u.id === id);
        return { value: id, label: user.name };
    });

    const uniqueStatuses = Array.from(
        new Set(allTasks.map((t) => t.status).filter(Boolean))
    ).map((s) => ({ value: s, label: s }));

    /** ----------------------------
     * Filter menu definition
     * ---------------------------- */
    const filterDefinitions = [
        {
            key: "selectedUsers",
            type: "multi-select",
            label: "Assigned Users",
            options: userOptions,
        },
        {
            key: "sortOrder",
            type: "toggle",
            label: "Sort by Due Date",
            toggleLabels: ["asc", "desc"], // Ascending/Descending
        },
        {
            key: "showCompleted",
            type: "checkbox",
            label: "Show Completed",
        },
        {
            key: "status",
            type: "select",
            label: "Status",
            options: uniqueStatuses,
        },
    ];

    /** ----------------------------
 * Render
 * ---------------------------- */
    return (
        <div className="section">
            {/* Title + Filter Button Row */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h1 className="title">Notion Tasks</h1>

                {/* TaskFilterMenu button/modal */}
                <TaskFilterMenu
                    filters={filterDefinitions}
                    values={filters}
                    onChange={setFilters}
                    isModal={true}
                    buttonLabel="Filters"
                />
            </div>

            {/* Tasks list */}
            <TasksTemplate
                tasks={visibleTasks}
                currentUser={currentUser}
                isAdmin={isAdmin}
                layout="horizontal"
                onTasksChange={setVisibleTasks}
                allowReopen={true}
                showTaskButtons={showTaskButtons}
                taskUiElements={taskUiElements}
            />

            {/* Infinite scroll loader sentinel */}
            <div ref={loaderRef} style={{ height: "40px" }} />
        </div>
    );

}
