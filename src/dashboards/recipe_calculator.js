/**
 * A component for loading Notion-based recipes,
 * identifying which ingredients are user-controlled, and computing
 * dependent ingredient values.
 *
 * New Feature:
 *  - Accepts `controllingInputs` prop: a map where
 *      key = recipe name (string)
 *      value = array of input ingredient keys (strings)
 *
 *  - Only the ingredients listed in controllingInputs[recipeName]
 *    are editable. All others become dependent read-only values.
 */

import React, { useEffect, useState } from "react";
import {
    LOGGER,
    SingleSelector,
    ComponentLoading,
    getNamedApi
} from "@rumpushub/common-react";

/* ---------------------------------------------
 * API ENDPOINT CONSTANTS
 * --------------------------------------------- */
const API_NAME = "RUMPSHIFT_API";

const RECIPE_LIST_ENDPOINT =
    "/api/notion/db/2a9cee7d24dc80a19293e3b115aed0a6?integration=NOTION_API_KEY_PROJECT_MANAGEMENT";

const pagePropertiesUrl = (cleanedId) =>
    `/api/notion/page_properties/${cleanedId}?integration=NOTION_API_KEY_PROJECT_MANAGEMENT`;

const computeRecipeUrl = (recipeId) => `/api/notion/recipes/compute/${recipeId}/?integration=NOTION_API_KEY_PROJECT_MANAGEMENT`;

/* ---------------------------------------------
 * COMPONENT
 * --------------------------------------------- */

export default function RecipeCalculator({ controllingInputs = {} }) {
    /* ---------------------------------------------
     * STATE
     * --------------------------------------------- */
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);

    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [inputs, setInputs] = useState({});
    const [result, setResult] = useState(null);

    const [initialLoading, setInitialLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [submitLoading, setSubmitLoading] = useState(false);

    const [error, setError] = useState(null);

    const api = getNamedApi(API_NAME);

    /* ---------------------------------------------
     * LOAD RECIPE LIST
     * --------------------------------------------- */
    useEffect(() => {
        const loadRecipes = async () => {
            try {
                setInitialLoading(true);
                setError(null);

                const response = await api.get(RECIPE_LIST_ENDPOINT);
                const list = response?.data?.results ?? [];

                setRecipes(list);

                if (list.length > 0) {
                    setSelectedRecipeId(list[0].id);
                }

                LOGGER.info("[RecipeCalculator] Loaded recipe list", list);
            } catch (err) {
                LOGGER.error("[RecipeCalculator] Failed loading recipe list", err);
                setError("Failed to load recipes.");
            } finally {
                setInitialLoading(false);
            }
        };

        loadRecipes();
    }, []);

    /* ---------------------------------------------
     * LOAD DETAILS FOR SELECTED RECIPE
     * --------------------------------------------- */
    useEffect(() => {
        if (!selectedRecipeId) return;

        const loadDetails = async () => {
            try {
                setDetailsLoading(true);
                setError(null);

                setSelectedRecipe(null);
                setInputs({});
                setResult(null);

                const cleanedId = selectedRecipeId.replace(/-/g, "");
                const response = await api.get(pagePropertiesUrl(cleanedId));

                const page = response?.data ?? null;
                if (!page) throw new Error("No page data returned");

                LOGGER.info("[RecipeCalculator] Page contents:", page);

                /* Extract editable + dependent fields */
                const numericFields = Object.entries(page)
                    .map(([key, value]) => {
                        if (!value) return null;

                        // direct number
                        if (typeof value === "number") {
                            return { key, label: key, type: "number" };
                        }

                        // simple date
                        if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
                            return { key, label: key, type: "date" };
                        }

                        // Notion object: number or date formulas
                        if (typeof value === "object") {
                            if (value.type === "number") {
                                return { key, label: key, type: "number" };
                            }
                            if (value.type === "formula") {
                                if (value.formula?.type === "number") {
                                    return { key, label: key, type: "number" };
                                }
                                if (value.formula?.type === "date") {
                                    return { key, label: key, type: "date" };
                                }
                            }
                        }

                        return null;
                    })
                    .filter(Boolean);

                const recipeName = page.Name || "Unnamed";

                const recipe = {
                    id: selectedRecipeId,
                    name: recipeName,
                    inputs: numericFields
                };

                setSelectedRecipe(recipe);

                /* Initialize input state */
                const defaults = {};
                numericFields.forEach(f => (defaults[f.key] = ""));
                setInputs(defaults);

            } catch (err) {
                LOGGER.error("[RecipeCalculator] Failed loading recipe details", err);
                setError("Failed to load recipe details.");
            } finally {
                setDetailsLoading(false);
            }
        };

        loadDetails();
    }, [selectedRecipeId]);

    /* ---------------------------------------------
     * INPUT CHANGE
     * --------------------------------------------- */
    const handleInputChange = (key, value) => {
        setInputs((prev) => ({
            ...prev,
            [key]: value
        }));
    };

    /* ---------------------------------------------
     * SUBMIT & COMPUTE
     * --------------------------------------------- */
    const handleSubmit = async () => {
        if (!selectedRecipe) return;

        setSubmitLoading(true);
        setError(null);
        setResult(null);

        try {
            const url = computeRecipeUrl(selectedRecipe.id);
            const response = await api.post(url, { inputs });

            LOGGER.info("[RecipeCalculator] Computed result:", response?.data);
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

    if (initialLoading) return <ComponentLoading />;

    const recipeOptions = recipes.map((r) => ({
        label: r.properties?.Name?.title?.[0]?.plain_text || "Unnamed",
        value: r.id
    }));

    /* Determine which inputs are user-controlled */
    const controllingList =
        selectedRecipe?.name && controllingInputs[selectedRecipe.name]
            ? controllingInputs[selectedRecipe.name]
            : [];

    /* Quick lookup for performance */
    const controllingSet = new Set(controllingList);

    /* Split fields */
    const editableFields =
        selectedRecipe?.inputs.filter(f => controllingSet.has(f.key)) || [];

    const dependentFields =
        selectedRecipe?.inputs.filter(f => !controllingSet.has(f.key)) || [];

    return (
        <div className="p-4">
            <h2 className="title is-4">Recipe Calculator</h2>

            {error && <div className="notification is-danger is-light">{error}</div>}

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

            {/* Loading Recipe Details */}
            {detailsLoading && (
                <div className="box">
                    <ComponentLoading text="Loading recipe..." />
                </div>
            )}

            {/* Main Input Form */}
            {!detailsLoading && selectedRecipe && (
                <div className="box">
                    <h3 className="title is-5">{selectedRecipe.name}</h3>

                    {/* Compute Button moved to top */}
                    <button
                        className={`button is-primary mb-4 ${submitLoading ? "is-loading" : ""}`}
                        onClick={handleSubmit}
                    >
                        Compute Recipe
                    </button>

                    {/* ---------------------------------------
            Editable Inputs Section
        ---------------------------------------- */}
                    <h4 className="title is-6 mb-2">Input Fields</h4>

                    {editableFields.map((field) => (
                        <div className="field" key={field.key}>
                            <label className="label">{field.label}</label>
                            <div className="control">
                                <input
                                    type={field.type}
                                    className="input"
                                    value={inputs[field.key]}
                                    disabled={false}
                                    onChange={(e) =>
                                        handleInputChange(field.key, e.target.value)
                                    }
                                />
                            </div>
                        </div>
                    ))}

                    {/* Divider */}
                    <hr className="my-4" />

                    {/* ---------------------------------------
            Dependent Fields Section
        ---------------------------------------- */}
                    <h4 className="title is-6 mb-2">Dependent Fields (Computed)</h4>

                    {dependentFields.map((field) => (
                        <div className="field" key={field.key}>
                            <label className="label">
                                {field.label}
                                <span className="tag is-info is-light ml-2">dependent</span>
                            </label>

                            <div className="control">
                                <input
                                    type={field.type}
                                    className="input"
                                    value={
                                        result?.[field.key] !== undefined
                                            ? result[field.key]
                                            : ""
                                    }
                                    disabled={true}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Result Display */}
            {result && (
                <div className="notification is-info mt-4">
                    <h4 className="title is-6">Computed Results</h4>
                    <pre style={{ whiteSpace: "pre-wrap" }}>
                        {JSON.stringify(result, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}
