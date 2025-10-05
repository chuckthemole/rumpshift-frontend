import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    TasksTemplate,
    ToggleSwitch,
    ControlButtonRetro,
    LOGGER,
    ApiPersistence
} from "@rumpushub/common-react";
import dummyTasks from "./test_data/test_notion_tasks";
import { parseNotionTasks } from "./utils";

export default function NotionTasks() {
    const [allTasks, setAllTasks] = useState([]);
    const [visibleTasks, setVisibleTasks] = useState([]);
    const [page, setPage] = useState(1);
    const loaderRef = useRef(null);

    const PAGE_SIZE = 10;

    // Create persistence instance for this API endpoint
    const notionTasksPersistence = ApiPersistence(
        "/notion-api/integrations/notion/projectManagementIntegration/database"
        // "MAIN" // optional — defaults to MAIN
    );

    useEffect(() => {
        async function fetchTasks() {
            try {
                const data = await notionTasksPersistence.getAll({
                    params: { name: "tasks" }
                });

                const parsed = parseNotionTasks(data);
                setAllTasks(parsed);
                setVisibleTasks(parsed.slice(0, PAGE_SIZE));
            } catch (err) {
                // Log the raw error first
                LOGGER.group("Notion fetchTasks error");
                LOGGER.error("Raw error object:", err);

                // Try to log properties if they exist
                if (err) {
                    LOGGER.error("err.message:", err.message);
                    LOGGER.error("err.name:", err.name);
                    LOGGER.error("err.stack:", err.stack);
                    LOGGER.error("err.response:", err.response);
                    if (err.response) {
                        LOGGER.error("err.response.status:", err.response.status);
                        LOGGER.error("err.response.data:", err.response.data);
                    }
                } else {
                    LOGGER.error("err is undefined or null");
                }
                LOGGER.groupEnd();

                // Fallback to dummy tasks
                setAllTasks(dummyTasks);
                setVisibleTasks(dummyTasks.slice(0, PAGE_SIZE));
            }
        }

        fetchTasks();
    }, []);

    // Infinite scroll logic
    const loadMore = useCallback(() => {
        setPage((prev) => {
            const nextPage = prev + 1;
            setVisibleTasks(allTasks.slice(0, nextPage * PAGE_SIZE));
            return nextPage;
        });
    }, [allTasks]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) loadMore();
            },
            { threshold: 1.0 }
        );

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => {
            if (loaderRef.current) observer.unobserve(loaderRef.current);
        };
    }, [loadMore]);

    const currentUser = { id: "u1", name: "Alice Johnson" };
    const isAdmin = true;

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
                    },
                ]}
            />

            {/* Infinite scroll loader sentinel */}
            <div ref={loaderRef} style={{ height: "40px" }} />
        </div>
    );
}
