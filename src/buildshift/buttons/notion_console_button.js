import React from "react";
import { Link } from "react-router-dom";

/**
 * NotionConsoleButton
 *
 * A simple Bulma-styled button that links to the Notion Console page.
 * Uses react-router's <Link> for client-side navigation.
 */
export default function NotionConsoleButton({ label = "Open Notion Console" }) {
    return (
        <Link to="/notion_console/" className="button is-primary is-rounded">
            {label}
        </Link>
    );
}
