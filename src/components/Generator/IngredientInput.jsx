import React, { useState, useEffect } from "react"; // Make sure useEffect is imported
import { Upload, Plus, X, Search, AlertTriangle } from "lucide-react";
import AIGenerationLoader from "./AIGenerationLoader";
import RecipeResults from "./RecipeResults";
import "./IngredientInput.css";

const IngredientInput = ({ onImageUpload }) => {
  const [inputValue, setInputValue] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState(null);
  const [attemptedSearch, setAttemptedSearch] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(0); // State for dynamic progress

  const handleAddIngredient = () => {
    if (inputValue.trim()) {
      setIngredients([...ingredients, inputValue.trim()]);
      setInputValue("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const handleRemoveIngredient = (index) => {
    const newIngredients = [...ingredients];
    newIngredients.splice(index, 1);
    setIngredients(newIngredients);
  };

  // useEffect to handle progress simulation
  useEffect(() => {
    let timer;
    if (isGenerating) {
      setCurrentProgress(0); // Reset progress when generation starts
      timer = setInterval(() => {
        setCurrentProgress(prevProgress => {
          // Stop a bit before 100% to let the API call truly "finish" it,
          // or if you want it to reach 100% just before API call finishes, adjust limit.
          if (prevProgress >= 99) {
            return 99;
          }
          // Simulate somewhat realistic progress, not too fast, not too slow
          const increment = Math.floor(Math.random() * 5) + 2; // Increment by 2 to 6
          return Math.min(prevProgress + increment, 99);
        });
      }, 350); // Interval time for progress update (e.g., 350ms)
    } else {
      // When generation stops (success, error, or no results)
      clearInterval(timer);
      if (attemptedSearch && !error && recipes.length > 0) {
        setCurrentProgress(100); // Success with results
      } else if (attemptedSearch && !error && recipes.length === 0) {
        setCurrentProgress(100); // No results found (search completed)
      } else if (error) {
        setCurrentProgress(0); // Or a specific error progress if desired
      } else {
        setCurrentProgress(0); // Default reset
      }
    }
    return () => clearInterval(timer); // Cleanup timer
  }, [isGenerating, attemptedSearch, recipes, error]); // Dependencies for the effect

  const handleSubmit = async () => {
    if (ingredients.length > 0) {
      setIsGenerating(true); // This will trigger the useEffect for progress
      setError(null);
      setRecipes([]);
      setAttemptedSearch(true);

      try {
        // Optional: Simulate a minimum loading time if API is very fast
        // await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await fetch("https://recipe-ctre.onrender.com/recipes/recommend", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ingredients),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ detail: "Failed to fetch recipes." }));
          throw new Error(errorData.detail || "Failed to fetch recipes.");
        }

        const data = await response.json();
        setRecipes(data.results || []);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        setError(error.message || "An unexpected error occurred.");
        setRecipes([]);
      } finally {
        setIsGenerating(false); // This will trigger useEffect to set final progress (100 or 0)
      }
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        if (onImageUpload) {
          onImageUpload(file);
        }
        setIsUploading(false);
      }, 1000);
    }
  };

  const showNoResultsMessage = !isGenerating && attemptedSearch && recipes.length === 0 && !error;
  const showErrorMessage = !isGenerating && attemptedSearch && error;

  return (
    <>
      <div className="ingredient-container">
        <div className="ingredient-header">
          <h2>What ingredients do you have?</h2>
          <p>Enter ingredients you have on hand or upload a photo of your list of ingredients</p>
        </div>

        <div className="ingredient-form">
          <div className="input-wrapper">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter ingredients (e.g., chicken, rice)"
              className="ingredient-input"
              aria-label="Enter ingredient"
            />
            {inputValue && (
              <button onClick={() => setInputValue("")} className="clear-btn" aria-label="Clear input">
                <X size={16} />
              </button>
            )}
            <button onClick={handleAddIngredient} className="add-btn">
              <Plus size={16} /> Add
            </button>
          </div>

          <div className="upload-buttons">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              hidden
              id="fileInput"
            />
            <button
              className="upload-btn"
              disabled={isUploading}
              onClick={() => document.getElementById("fileInput").click()}
            >
              <Upload size={16} /> {isUploading ? "Uploading..." : "Upload Image"}
            </button>
          </div>

          {ingredients.length > 0 && (
            <div className="ingredient-list">
              <p>Your ingredients:</p>
              <div className="tags">
                {ingredients.map((ingredient, index) => (
                  <div key={index} className="tag">
                    {ingredient}
                    <button onClick={() => handleRemoveIngredient(index)} className="remove-btn" aria-label={`Remove ${ingredient}`}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="submit-btn"
            disabled={ingredients.length === 0 || isGenerating || isUploading}
          >
            <Search size={16} /> {isGenerating ? "Finding..." : "Find Recipes"}
          </button>
        </div>
      </div>

      {/* Loader: Pass relevant props to AIGenerationLoader */}
      {isGenerating && (
        <div className="loader-wrapper">
          <AIGenerationLoader
            isGenerating={isGenerating} // Pass the actual isGenerating state from parent
            progress={currentProgress}  // Pass the dynamic currentProgress state
            title="Searching for recipes..."
            description="Our AI is looking for the best matches for your ingredients."
          />
        </div>
      )}

      {/* Display Error Message */}
      {showErrorMessage && (
        <div className="results-section no-results-message error-message">
          <AlertTriangle size={48} className="no-results-icon error-icon" />
          <h3>Oops! Something went wrong.</h3>
          <p>{error}</p>
          <p>Please try again later or adjust your ingredients.</p>
        </div>
      )}

      {/* Display No Recipes Found Message */}
      {showNoResultsMessage && (
        <div className="results-section no-results-message">
          <Search size={48} className="no-results-icon" />
          <h3>No Recipes Found</h3>
          <p>We couldn't find any recipes matching your current ingredients. Try adding more or different items!</p>
        </div>
      )}

      {/* Display Recipes */}
      {!isGenerating && !error && recipes.length > 0 && (
        <div className="results-section">
          <h2>Recipe Suggestions</h2>
          <RecipeResults recipes={recipes} />
        </div>
      )}
    </>
  );
};

export default IngredientInput;