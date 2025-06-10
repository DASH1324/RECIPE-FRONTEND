import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import RecipeCard from "./RecipeCard"; 
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../buttons/tabs"; 
import "./RecipeResults.css"; 

const SavedRecipes = () => {
  const [savedRecipes, setSavedRecipes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("all");

  // Get the user's name from localStorage.
  const fullName = localStorage.getItem("full_name");

  useEffect(() => {
    // This function fetches the data from the insecure backend.
    const fetchSavedRecipes = async () => {
      // If there's no full name, the user is not logged in. Stop the process.
      if (!fullName) {
        console.error("No user name found in localStorage. User must be logged in.");
        setIsLoading(false); 
        setSavedRecipes([]);
        return;
      }

      try {
        // ================== APPLIED CHANGES START HERE ==================

        // 1. The URL is now constructed to include the user's name from localStorage.
        const url = `https://recipe-ctre.onrender.com/save/saved-recipes/${fullName}`;

        // 2. The request options no longer need the 'Authorization' header.
        const options = {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
            // The token is not sent because the backend endpoint doesn't use it.
          }
        };

        // 3. Make the API call using the new URL and options.
        const response = await fetch(url, options);

        // =================== APPLIED CHANGES END HERE ===================

        if (!response.ok) {
          const errorData = await response.json();
          // Show the specific error from the backend (e.g., "User not found")
          throw new Error(errorData.detail || `Failed to fetch: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Fetched saved recipes:", data);

        // Ensure the response has the expected 'recipes' array.
        if (Array.isArray(data.recipes)) {
          setSavedRecipes(data.recipes);
        } else {
          console.warn("Expected 'recipes' to be an array, but received:", typeof data.recipes);
          setSavedRecipes([]); // Default to an empty array on unexpected format.
        }
      } catch (error) {
        console.error("Error fetching saved recipes:", error);
        setSavedRecipes([]); // Clear recipes on error.
      } finally {
        // This runs whether the fetch succeeded or failed.
        setIsLoading(false);
      }
    };

    fetchSavedRecipes();
  // The effect now depends on `fullName`. If the user logs in/out, it will re-run.
  }, [fullName]); 

  // Filter recipes based on the active difficulty tab.
  const filteredRecipes = savedRecipes.filter((recipe) => {
    return (
      activeTab === "all" ||
      recipe.difficulty?.toLowerCase() === activeTab.toLowerCase()
    );
  });

  // A helper function to render the main content area.
  const renderRecipeContent = (recipes) => {
    // Show a loading spinner while fetching data.
    if (isLoading) {
      return (
        <div className="loading">
          <Loader2 className="spinner" />
          <span>Loading saved recipes...</span>
        </div>
      );
    }
    
    // If the user isn't logged in, show a specific message.
    if (!fullName) {
        return <p className="no-results">Please log in to view your saved recipes.</p>
    }

    // Show a message if there are no recipes in the current category.
    if (recipes.length === 0) {
      return <p className="no-results">No saved recipes in this category.</p>;
    }

    // Display the grid of recipes.
    return (
      <div className="recipe-grid">
        {recipes.map((recipe, index) => (
          <RecipeCard
            key={index}
            title={recipe.recipe_name}
            image={recipe.image_url}
            cookingTime={recipe.cook_time}
            difficulty={recipe.difficulty}
            recipeNumber={recipe.recipe_number} // This prop might be undefined, ensure RecipeCard handles it
            onClick={() => console.log("Clicked saved recipe:", recipe.recipe_name)}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="recipe-container">
      {/* Show the full name if it exists, otherwise show nothing or 'Guest' */}
      <h2>Saved Recipes{fullName ? ` for ${fullName}` : ''}</h2>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="tabs">
        <TabsList className="tabs-list">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="easy">Easy</TabsTrigger>
          <TabsTrigger value="medium">Medium</TabsTrigger>
          <TabsTrigger value="hard">Hard</TabsTrigger>
        </TabsList>

        <TabsContent value="all">{renderRecipeContent(filteredRecipes)}</TabsContent>
        <TabsContent value="easy">{renderRecipeContent(filteredRecipes)}</TabsContent>
        <TabsContent value="medium">{renderRecipeContent(filteredRecipes)}</TabsContent>
        <TabsContent value="hard">{renderRecipeContent(filteredRecipes)}</TabsContent>
      </Tabs>
    </div>
  );
};

export default SavedRecipes;