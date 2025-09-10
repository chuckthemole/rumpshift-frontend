import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    TasksTemplate,
    ToggleSwitch,
    ControlButtonRetro,
    getApi,
    LOGGER,
} from "@rumpushub/common-react";
import { parseNotionTasks } from "./utils";
import dummyTasks from "./test_data/test_notion_tasks";

export default function NotionTasks() {
    const [allTasks, setAllTasks] = useState([]); // all tasks from API
    const [visibleTasks, setVisibleTasks] = useState([]); // tasks shown
    const [page, setPage] = useState(1);
    const loaderRef = useRef(null);

    const PAGE_SIZE = 10;

    useEffect(() => {
        async function fetchTasks() {
            try {
                const api = getApi();
                const { data } = await api.get(
                    "/notion-api/integrations/notion/database/1a4b11ab09b344d59cd654016930ccf0"
                );
                const parsed = parseNotionTasks(data);
                setAllTasks(parsed);
                setVisibleTasks(parsed.slice(0, PAGE_SIZE)); // initial 10
            } catch (err) {
                LOGGER.error("Failed to fetch tasks from Notion API:", err);
                setAllTasks(dummyTasks);
                setVisibleTasks(dummyTasks.slice(0, PAGE_SIZE));
            }
        }

        fetchTasks();
    }, []);

    // Load more when "loader" div enters viewport
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
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { threshold: 1.0 }
        );

        if (loaderRef.current) {
            observer.observe(loaderRef.current);
        }

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
