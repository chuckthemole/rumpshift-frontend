/**
 * RecipeCalculator Component
 *
 * Loads recipe records from Notion, extracts numeric fields,
 * identifies editable fields based on a controllingInputs map,
 * and computes dependent values via the backend.
 *
 * Props:
 *  - controllingInputs: {
 *        [recipeName]: [array of keys that are editable]
 *    }
 */

import React, { useEffect, useState } from "react";
import {
    LOGGER,
    SingleSelector,
    ComponentLoading,
    getNamedApi
} from "@rumpushub/common-react";

/* ---------------------------------------------
 * API CONSTANTS
 * --------------------------------------------- */
const API_NAME = "RUMPSHIFT_API";

const RECIPE_LIST_ENDPOINT =
    "/api/notion/db/2a9cee7d24dc80a19293e3b115aed0a6?integration=NOTION_API_KEY_PROJECT_MANAGEMENT";

const pagePropertiesUrl = (cleanedId) =>
    `/api/notion/page_properties/${cleanedId}?integration=NOTION_API_KEY_PROJECT_MANAGEMENT`;

const computeRecipeUrl = (recipeId) =>
    `/api/notion/recipes/compute/${recipeId}/?integration=NOTION_API_KEY_PROJECT_MANAGEMENT`;

/* ---------------------------------------------
 * COMPONENT
 * --------------------------------------------- */
export default function RecipeCalculator({ controllingInputs = {} }) {
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);

    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [selectedRecipePage, setSelectedRecipePage] = useState(null);

    const [inputs, setInputs] = useState({});
    const [result, setResult] = useState(null);

    const [initialLoading, setInitialLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [error, setError] = useState(null);

    const api = getNamedApi(API_NAME);

    /* ---------------------------------------------
     * LOAD LIST OF RECIPES
     * --------------------------------------------- */
    useEffect(() => {
        const loadRecipes = async () => {
            try {
                setInitialLoading(true);
                setError(null);

                const response = await api.get(RECIPE_LIST_ENDPOINT);
                const results = response?.data?.results ?? [];
                setRecipes(results);

                if (results.length > 0) {
                    setSelectedRecipeId(results[0].id);
                }

                LOGGER.info("[RecipeCalculator] Loaded recipe list", results);
            } catch (err) {
                LOGGER.error("[RecipeCalculator] Could not load recipe list", err);
                setError("Failed to load recipes.");
            } finally {
                setInitialLoading(false);
            }
        };

        loadRecipes();
    }, []);

    /* ---------------------------------------------
     * LOAD SELECTED RECIPE DETAILS
     * --------------------------------------------- */
    useEffect(() => {
        if (!selectedRecipeId) return;

        const loadDetails = async () => {
            try {
                setDetailsLoading(true);
                setError(null);

                setSelectedRecipe(null);
                setSelectedRecipePage(null);
                setInputs({});
                setResult(null);

                const cleanedId = selectedRecipeId.replace(/-/g, "");
                const response = await api.get(pagePropertiesUrl(cleanedId));

                const page = response?.data ?? null;
                if (!page) throw new Error("Page returned no data.");

                setSelectedRecipePage(page);

                LOGGER.info("[RecipeCalculator] Loaded page properties:", page);

                const fields = Object.entries(page)
                    .map(([key, value]) => {
                        // include null values (as blank numeric inputs)
                        if (value === null) {
                            return { key, label: key, type: "number" };
                        }

                        // skip only undefined
                        if (value === undefined) return null;

                        if (typeof value === "number") {
                            return { key, label: key, type: "number" };
                        }

                        if (value?.type === "number") {
                            return { key, label: key, type: "number" };
                        }

                        if (value?.type === "formula") {
                            if (value.formula?.type === "number") {
                                return { key, label: key, type: "number" };
                            }
                            if (value.formula?.type === "date") {
                                return { key, label: key, type: "date" };
                            }
                        }

                        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
                            return { key, label: key, type: "date" };
                        }

                        return null;
                    })
                    .filter(Boolean);

                const recipeName = page.Name || "Unnamed";
                setSelectedRecipe({
                    id: selectedRecipeId,
                    name: recipeName,
                    inputs: fields
                });

                // Prepare initial input values (null → "")
                const defaults = {};
                fields.forEach((field) => {
                    const v = page[field.key];
                    let num = null;

                    if (typeof v === "number") num = v;
                    else if (v?.type === "number") num = v.number;
                    else if (v?.type === "formula" && v.formula?.type === "number") {
                        num = v.formula.number;
                    }

                    defaults[field.key] = num ?? "";
                });

                setInputs(defaults);
            } catch (err) {
                LOGGER.error("[RecipeCalculator] Could not load recipe details", err);
                setError("Failed to load recipe details.");
            } finally {
                setDetailsLoading(false);
            }
        };

        loadDetails();
    }, [selectedRecipeId]);

    /* ---------------------------------------------
     * HANDLE INPUT CHANGE
     * --------------------------------------------- */
    const handleInputChange = (key, value) => {
        setInputs((prev) => ({ ...prev, [key]: value }));
    };

    /* ---------------------------------------------
     * SUBMIT COMPUTE REQUEST
     * --------------------------------------------- */
    const handleSubmit = async () => {
        if (!selectedRecipe) return;

        setSubmitLoading(true);
        setError(null);
        setResult(null);

        try {
            const url = computeRecipeUrl(selectedRecipe.id);
            const response = await api.post(url, { inputs });

            LOGGER.info("[RecipeCalculator] Compute result:", response?.data);

            setResult(response?.data ?? {});
        } catch (err) {
            LOGGER.error("[RecipeCalculator] Compute failed", err);
            setError("Failed to compute recipe.");
        } finally {
            setSubmitLoading(false);
        }
    };

    /* ---------------------------------------------
     * RENDER
     * --------------------------------------------- */

    if (initialLoading) {
        return <ComponentLoading />;
    }

    const recipeOptions = recipes.map((r) => ({
        label: r.properties?.Name?.title?.[0]?.plain_text || "Unnamed",
        value: r.id
    }));

    const recipeName = selectedRecipe?.name;
    const editableKeys =
        recipeName && controllingInputs[recipeName]
            ? new Set(controllingInputs[recipeName])
            : new Set();

    const editableFields = selectedRecipe?.inputs.filter((f) =>
        editableKeys.has(f.key)
    ) || [];

    const dependentFields = [];

    // Page-based dependent fields
    selectedRecipe?.inputs.forEach((f) => {
        if (!editableKeys.has(f.key)) {
            const v = selectedRecipePage?.[f.key];
            let num = null;

            if (typeof v === "number") num = v;
            else if (v?.type === "number") num = v.number;
            else if (v?.type === "formula" && v.formula?.type === "number") {
                num = v.formula.number;
            }

            dependentFields.push({
                key: f.key,
                label: f.label,
                type: f.type,
                value: num
            });
        }
    });

    // Computed fields
    if (result) {
        Object.entries(result).forEach(([key, value]) => {
            const exists = dependentFields.some((f) => f.key === key);
            if (!exists && !editableKeys.has(key)) {
                dependentFields.push({
                    key,
                    label: key,
                    type: typeof value === "number" ? "number" : "text",
                    value
                });
            }
        });
    }

    return (
        <div className="p-4">
            <h2 className="title is-4">Recipe Calculator</h2>

            {error && (
                <div className="notification is-danger is-light">
                    {error}
                </div>
            )}

            {/* Recipe Selector */}
            <div className="mb-4">
                <label className="label">Select a Recipe</label>
                <SingleSelector
                    options={recipeOptions}
                    value={selectedRecipeId}
                    onChange={setSelectedRecipeId}
                    placeholder="Choose recipe..."
                />
            </div>

            {/* Computed Result Block */}
            {result && (
                <div className="notification is-info mb-4">
                    <h4 className="title is-6">Computed Results</h4>
                    <pre style={{ whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(result, null, 2)}
                    </pre>

                    {selectedRecipeId && (
                        <p className="mt-2">
                            <a
                                href={`https://www.notion.so/${selectedRecipeId.replace(/-/g, "")}`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Open in Notion
                            </a>
                        </p>
                    )}
                </div>
            )}

            {/* Loading Details */}
            {detailsLoading && (
                <div className="box">
                    <ComponentLoading text="Loading recipe..." />
                </div>
            )}

            {/* Input Form */}
            {!detailsLoading && selectedRecipe && (
                <div className="box">
                    <h3 className="title is-5">{selectedRecipe.name}</h3>

                    <button
                        className={`button is-primary mb-4 ${submitLoading ? "is-loading" : ""
                            }`}
                        onClick={handleSubmit}
                    >
                        Compute Recipe
                    </button>

                    {/* Editable Inputs */}
                    <h4 className="title is-6 mb-2">Input Fields</h4>
                    {editableFields.map((field) => (
                        <div className="field" key={field.key}>
                            <label className="label">{field.label}</label>
                            <div className="control">
                                <input
                                    className="input"
                                    type={field.type}
                                    value={inputs[field.key]}
                                    onChange={(e) =>
                                        handleInputChange(field.key, e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    ))}

                    <hr className="my-4" />

                    {/* Dependent Fields */}
                    <h4 className="title is-6 mb-2">
                        Dependent Fields (Computed)
                    </h4>
                    {dependentFields.map((field) => (
                        <div className="field" key={field.key}>
                            <label className="label">
                                {field.label}
                                <span className="tag is-info is-light ml-2">
                                    dependent
                                </span>
                            </label>
                            <div className="control">
                                <input
                                    className="input"
                                    type={field.type}
                                    value={result?.[field.key] ?? field.value ?? ""}
                                    disabled
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
