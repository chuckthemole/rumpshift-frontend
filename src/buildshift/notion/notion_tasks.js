import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    TasksTemplate,
    ControlButtonRetro,
    LOGGER,
    ApiPersistence,
} from "@rumpushub/common-react";
import dummyTasks from "./test_data/test_notion_tasks";
import { parseNotionTasks } from "./utils";

/**
 * NotionTasks Component
 * ---------------------
 * Fetches and displays tasks from the Notion integration API.
 * Includes infinite scroll pagination and optional task control buttons.
 *
 * @param {Object} props
 * @param {boolean} [props.showTaskButtons=false] - Whether to show task action buttons.
 */
export default function NotionTasks({ showTaskButtons = false }) {
    /** ----------------------------
     * State & Constants
     * ---------------------------- */
    const [allTasks, setAllTasks] = useState([]);
    const [visibleTasks, setVisibleTasks] = useState([]);
    const [page, setPage] = useState(1);
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
                const data = await notionTasksPersistence.getAll({
                    params: { name: "tasks" },
                });

                const parsed = parseNotionTasks(data);
                setAllTasks(parsed);
                setVisibleTasks(parsed.slice(0, PAGE_SIZE));
            } catch (err) {
                LOGGER.group("Notion fetchTasks error");
                LOGGER.error("Raw error object:", err);

                if (err) {
                    LOGGER.error("Message:", err.message);
                    LOGGER.error("Name:", err.name);
                    LOGGER.error("Stack:", err.stack);
                    if (err.response) {
                        LOGGER.error("Response status:", err.response.status);
                        LOGGER.error("Response data:", err.response.data);
                    }
                } else {
                    LOGGER.error("Error object was null or undefined.");
                }

                LOGGER.groupEnd();

                // Fallback to dummy data
                setAllTasks(dummyTasks);
                setVisibleTasks(dummyTasks.slice(0, PAGE_SIZE));
            }
        };

        fetchTasks();
    }, [notionTasksPersistence]);

    /** ----------------------------
     * Infinite scroll logic
     * ---------------------------- */
    const loadMore = useCallback(() => {
        setPage((prevPage) => {
            const nextPage = prevPage + 1;
            setVisibleTasks(allTasks.slice(0, nextPage * PAGE_SIZE));
            return nextPage;
        });
    }, [allTasks]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
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
     * Current user & permissions
     * ---------------------------- */
    const currentUser = { id: "u1", name: "Alice Johnson" };
    const isAdmin = true;

    /** ----------------------------
     * Task action buttons (if enabled)
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
     * Render
     * ---------------------------- */
    return (
        <div className="section">
            <h1 className="title">Notion Tasks</h1>

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
