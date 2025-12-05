import React from "react";
import { useLocation } from "react-router-dom";

export default function Search() {
    const query = new URLSearchParams(useLocation().search).get("q");

    return (
        <div>
            <h2>Search Results for: "{query}"</h2>
            {/* TODO: Implement video search results */}
        </div>
    );
}
