import React, { useEffect, useState } from "react";
import {
    LOGGER,
    SingleSelector,
    ComponentLoading,
    getNamedApi
} from "@rumpushub/common-react";

export default function RecipeCalculator() {
    const [recipes, setRecipes] = useState([]);
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [inputs, setInputs] = useState({});
    const [result, setResult] = useState(null);

    const [initialLoading, setInitialLoading] = useState(true);   // NEW
    const [detailsLoading, setDetailsLoading] = useState(false); // NEW

    const [submitLoading, setSubmitLoading] = useState(false);
    const [error, setError] = useState(null);

    // Load recipes list
    useEffect(() => {
        const loadRecipes = async () => {
            try {
                setInitialLoading(true);
                const api = getNamedApi("RUMPSHIFT_API");

                const response = await api.get(
                    "/api/notion/db/2a9cee7d24dc80a19293e3b115aed0a6?integration=NOTION_API_KEY_PROJECT_MANAGEMENT"
                );
                const list = response?.data?.results ?? [];

                setRecipes(list);
                if (list.length > 0) setSelectedRecipeId(list[0].id);

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

    // Load selected recipe page properties
    useEffect(() => {
        if (!selectedRecipeId) {
            LOGGER.info("[RecipeCalculator] No recipe selected, skipping details load.");
            return;
        }

        const loadRecipeDetails = async () => {
            try {
                LOGGER.info("[RecipeCalculator] Loading recipe details for:", selectedRecipeId);

                setSelectedRecipe(null);
                setInputs({});
                setResult(null);

                setDetailsLoading(true);

                const api = getNamedApi("RUMPSHIFT_API");
                const cleanedId = selectedRecipeId.replace(/-/g, "");

                const url = `/api/notion/page_properties/${cleanedId}?integration=NOTION_API_KEY_PROJECT_MANAGEMENT`;
                LOGGER.info("[RecipeCalculator] API URL:", url);

                const response = await api.get(url);
                LOGGER.info("[RecipeCalculator] Raw API response:", response);

                const page = response?.data ?? null;

                if (!page) {
                    LOGGER.warn("[RecipeCalculator] No page data returned!");
                    throw new Error("No recipe found");
                }

                LOGGER.info("[RecipeCalculator] Page contents received:", page);

                // BUILD INPUTS FROM FLAT PAGE OBJECT
                const inputsFromPage = Object.entries(page)
                    .map(([key, value]) => {
                        if (value && typeof value === "object") {
                            if (value.type === "number") return { key, label: key, type: "number" };
                            if (value.type === "formula") return { key, label: key, type: "number" };
                        }
                        if (typeof value === "number") {
                            return { key, label: key, type: "number" };
                        }
                        return null;
                    })
                    .filter(Boolean);

                LOGGER.info("[RecipeCalculator] Parsed input fields:", inputsFromPage);

                const recipeObj = {
                    id: selectedRecipeId,
                    name: page.Name || "Unnamed",
                    inputs: inputsFromPage
                };

                LOGGER.info("[RecipeCalculator] Setting selectedRecipe:", recipeObj);

                setSelectedRecipe(recipeObj);

                const defaultInputs = {};
                inputsFromPage.forEach(field => (defaultInputs[field.key] = ""));
                setInputs(defaultInputs);

                LOGGER.info("[RecipeCalculator] Initialized input state:", defaultInputs);

            } catch (err) {
                LOGGER.error("[RecipeCalculator] Failed loading recipe details", err);
                if (err.response) {
                    LOGGER.error("[RecipeCalculator] API Error Response:", err.response);
                }
                setError("Failed to load recipe details.");
            } finally {
                setDetailsLoading(false);
                LOGGER.info("[RecipeCalculator] Finished loading recipe details");
            }
        };

        loadRecipeDetails();
    }, [selectedRecipeId]);

    // Build dropdown options
    const recipeOptions = recipes.map(r => ({
        label: r.properties?.Name?.title?.[0]?.plain_text || "Unnamed",
        value: r.id || ""
    }));

    const handleInputChange = (key, value) => {
        setInputs(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handleSubmit = async () => {
        if (!selectedRecipe) return;

        setSubmitLoading(true);
        setResult(null);
        setError(null);

        try {
            const api = getNamedApi("RUMPSHIFT_API");

            const response = await api.post(`/recipes/compute/${selectedRecipe.id}`, {
                inputs
            });

            const computed = response?.data ?? {};
            LOGGER.info("[RecipeCalculator] Computed recipe:", computed);

            setResult(computed);
        } catch (err) {
            LOGGER.error("[RecipeCalculator] Compute failed", err);
            setError("Failed to compute recipe.");
        } finally {
            setSubmitLoading(false);
        }
    };

    // INITIAL LOAD ONLY
    if (initialLoading) return <ComponentLoading />;

    return (
        <div className="p-4">
            <h2 className="title is-4">Recipe Calculator</h2>

            {error && <div className="notification is-danger is-light">{error}</div>}

            <div className="mb-4">
                <label className="label">Select a Recipe</label>
                <SingleSelector
                    options={recipeOptions}
                    value={selectedRecipeId || ""}
                    onChange={(value) => setSelectedRecipeId(value)}
                    placeholder="Choose recipe..."
                />
            </div>

            {/* SHOW LOADING FOR RECIPE DETAILS */}
            {detailsLoading && (
                <div className="box">
                    <ComponentLoading text="Loading recipe..." />
                </div>
            )}

            {/* SHOW FORM ONLY WHEN NOT LOADING DETAILS */}
            {!detailsLoading && selectedRecipe && (
                <div className="box">
                    <h3 className="title is-5">{selectedRecipe.name}</h3>

                    {selectedRecipe.inputs.map(field => (
                        <div className="field" key={field.key}>
                            <label className="label">{field.label}</label>
                            <div className="control">
                                <input
                                    type={field.type}
                                    className="input"
                                    value={inputs[field.key]}
                                    onChange={e => handleInputChange(field.key, e.target.value)}
                                />
                            </div>
                        </div>
                    ))}

                    <button
                        className={`button is-primary mt-3 ${submitLoading ? "is-loading" : ""}`}
                        onClick={handleSubmit}
                    >
                        Compute Recipe
                    </button>
                </div>
            )}

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
