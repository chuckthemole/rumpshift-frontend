/**
 * Parse tasks from a Notion database response.
 *
 * Maps Notion's nested property structure into a normalized
 * task object that is easier for React components to consume.
 *
 * Expected fields:
 *  - Title (title property)
 *  - Sprints (relation property)
 *  - Assigned To (people property)
 *  - Status (select or multi_select)
 *  - Due Date (date property)
 *  - Short Description (rich_text property)
 *
 * @param {Object} notionResponse - Raw JSON response from the Notion API.
 * @returns {Array} Parsed tasks with normalized fields.
 */
function parseNotionTasks(notionResponse) {
    if (!notionResponse || !Array.isArray(notionResponse.results)) {
        return [];
    }

    return notionResponse.results.map((page) => {
        const props = page.properties || {};

        // Extract title
        const title = props.Title?.title?.[0]?.plain_text?.trim() || "Untitled";

        // Sprint relation (IDs only)
        const sprint = props["Sprints"]?.relation?.[0]?.id || null;

        // Status field (single or multi select)
        const status =
            props.Status?.select?.name ||
            (props.Status?.multi_select?.map((s) => s.name).join(", ") || "No Status");

        // Due date
        const dueDate = props["Due Date"]?.date?.start || null;

        // Assigned people
        const assignedTo =
            props["Assigned To"]?.people?.map((p) => ({
                id: p.id || null,
                name: p.name || "Unknown",
                avatar: p.avatar_url || null,
            })) || [];

        // Short description
        const shortDescription = props["Short Description"]?.rich_text
            ?.map((t) => t.plain_text)
            .join(" ")
            .trim() || "";

        // Build combined description for expanded view (optional: include sprint/status)
        const descriptionParts = [];
        if (status) descriptionParts.push(`Status: ${status}`);
        if (sprint) descriptionParts.push(`Sprint: ${sprint}`);
        if (shortDescription) descriptionParts.push(shortDescription);
        const description = descriptionParts.join("\n");

        return {
            id: page.id || null,
            title,
            sprint,
            description, // body text for expanded view
            assignedTo,
            dueDate,
            completed: false, // default until mapped
            highlighted: false, // default until mapped
            status,
        };
    });
}

/**
 * Parse leaderboard entries from a Notion database response.
 *
 * Maps Notion's nested property structure into a normalized
 * leaderboard entry object that is easier for React components to consume.
 *
 * Expected fields:
 *  - User (title property)
 *  - Count (number property)
 *  - Duration (number property, seconds)
 *  - Start Timestamp (date property)
 *  - End Timestamp (date property)
 *  - Notes (rich_text property)
 *
 * @param {Object} notionResponse - Raw JSON response from the Notion API.
 * @returns {Array} Parsed leaderboard entries with normalized fields.
 */
function parseLeaderboardData(notionResponse) {
    if (!notionResponse || !Array.isArray(notionResponse.results)) {
        console.warn("parseLeaderboardData: Invalid Notion response", notionResponse);
        return [];
    }

    return notionResponse.results.map((page) => {
        const props = page.properties || {};

        // Debug: log the raw page properties
        console.log("Leaderboard page props:", props);

        const rawDuration = props.Duration?.number ?? 0;
        const safeDuration =
            rawDuration > 0 && rawDuration < 86400 * 365 ? rawDuration : 0;

        // Start/End Timestamps
        let startRaw = null;
        let endRaw = null;

        if (props["Start Timestamp"]?.date) {
            startRaw = props["Start Timestamp"].date.start || null;
        }
        if (props["End Timestamp"]?.date) {
            endRaw = props["End Timestamp"].date.start || null;
        }

        // Debug: log raw timestamps
        console.log("Raw start/end:", startRaw, endRaw);

        const startTimestamp =
            startRaw && !startRaw.startsWith("1970")
                ? new Date(startRaw).toLocaleString()
                : new Date(page.created_time).toLocaleString(); // fallback to created_time

        const endTimestamp =
            endRaw && !endRaw.startsWith("1970")
                ? new Date(endRaw).toLocaleString()
                : new Date(page.last_edited_time).toLocaleString(); // fallback to last_edited_time


        const notes =
            props.Notes?.rich_text
                ?.map((t) => t.plain_text)
                .join(" ")
                .trim() || "";

        return {
            id: page.id || null,
            user: props.User?.title?.[0]?.plain_text?.trim() || "Unknown",
            count: props.Count?.number ?? 0,
            duration: safeDuration,
            startTimestamp,
            endTimestamp,
            notes,
        };
    });
}

export { parseNotionTasks, parseLeaderboardData };
