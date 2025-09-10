import React from "react";
import { Link } from "react-router-dom";

/**
 * LeaderboardButton
 *
 * A simple Bulma-styled button that links to the Leaderboard page.
 * Uses react-router's <Link> for client-side navigation.
 */
export default function LeaderboardButton({ label = "View Leaderboard" }) {
    return (
        <Link to="/notion_leader/" className="button is-info is-rounded">
            {label}
        </Link>
    );
}
