import React, { useState, useEffect } from "react";
import { Clock, ChefHat, Utensils, X, Bookmark } from "lucide-react";
// --- CORRECTED IMPORTS ---
// The component files (card.jsx, badge.jsx, etc.) are located in the 'ui' folder, not 'buttons'.
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
// --- END OF CORRECTIONS ---
import Swal from "sweetalert2";
import "./RecipeDetail.css";

const RecipeDetail = ({ data, onClose }) => {
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // We get the name from localStorage for display AND for the API call in this version.
  const storedFullName = localStorage.getItem("full_name") || "Guest User";

  const {
    recipe_name = "Unnamed Recipe",
    image_url = "",
    cook_time = "Unknown",
    difficulty = "Unknown",
    description = "No description provided",
    ingredients = [],
    instructions = [],
    servings = "N/A"
  } = data || {};

  const difficultyVariant = {
    Easy: "default",
    Medium: "secondary",
    Hard: "destructive",
  }[difficulty] || "default";

  useEffect(() => {
    const localSavedRecipes = JSON.parse(localStorage.getItem("saved_recipes")) || [];
    if (localSavedRecipes.includes(recipe_name)) {
      setIsSaved(true);
    }
  }, [recipe_name]);

  const handleSaveRecipe = () => {
    // Check if user is logged in before showing confirm dialog
    if (!storedFullName || storedFullName === "Guest User") {
        Swal.fire({
            icon: 'error',
            title: 'Not Logged In',
            text: 'You must be logged in to save a recipe.',
        });
        return;
    }
    setShowConfirm(true);
  };

  const confirmSave = async () => {
    setShowConfirm(false);

    // ================== REVERTED LOGIC STARTS HERE ==================

    // 1. Get user's name from localStorage.
    const fullNameFromStorage = localStorage.getItem('full_name');

    // 2. Add 'full_name' back to the request body.
    const recipeToSave = {
      full_name: fullNameFromStorage, // Using the name from storage
      recipe_name,
      description,
      ingredients,
      instructions,
      servings,
      difficulty,
      cook_time,
      image_url,
    };

    try {
      // 3. Remove the 'Authorization' header.
      const response = await fetch("https://recipe-ctre.onrender.com/save/save-recipe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // The Authorization header is removed.
        },
        body: JSON.stringify(recipeToSave),
      });

      // =================== REVERTED LOGIC ENDS HERE ===================

      const resultData = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Saved!",
          text: `"${recipe_name}" has been saved successfully.`,
          confirmButtonColor: "#3085d6",
        });

        setIsSaved(true);
        const localSavedRecipes = JSON.parse(localStorage.getItem("saved_recipes")) || [];
        if (!localSavedRecipes.includes(recipe_name)) {
          localSavedRecipes.push(recipe_name);
          localStorage.setItem("saved_recipes", JSON.stringify(localSavedRecipes));
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: resultData.detail || "Something went wrong!",
        });
      }
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Failed",
        text: "Failed to save recipe. Please try again.",
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>
          <X size={20} />
        </button>

        <div className="recipe-grid">
          <div className="recipe-image">
            <img src={image_url} alt={recipe_name} />
          </div>

          <div className="recipe-info">
            <h1 className="recipe-title">{recipe_name}</h1>
            <div className="recipe-details">
              <div className="recipe-detail"> <Clock size={18} /> <span>{cook_time}</span> </div>
              <div className="recipe-detail"> <Utensils size={18} /> <span>{servings}</span> </div>
              <Badge variant={difficultyVariant}> <ChefHat size={14} /> <span>{difficulty}</span> </Badge>
            </div>
            {!isSaved && (
              <button className="save-button" onClick={handleSaveRecipe}> <Bookmark size={16} /> Save Recipe </button>
            )}
            {isSaved && (<p className="saved-text">✓ Saved to Favorites</p>)}
          </div>
        </div>

        <Tabs defaultValue="ingredients" className="tabs-container">
          <TabsList>
            <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
          </TabsList>
          <TabsContent value="ingredients">
            <Card>
              <CardHeader><CardTitle>Ingredients</CardTitle></CardHeader>
              <CardContent> <ul> {ingredients.map((item, idx) => (<li key={idx}>{item}</li>))} </ul> </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="instructions">
            <Card>
              <CardHeader><CardTitle>Instructions</CardTitle></CardHeader>
              <CardContent> <ol> {instructions.map((step, idx) => (<li key={idx}>{step}</li>))} </ol> </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {showConfirm && (
        <div className="custom-modal">
          <div className="modal-box">
            <p>Are you sure you want to save "{recipe_name}" to favorites?</p>
            <div className="modal-buttons">
              <button onClick={confirmSave} className="confirm-btn">Yes</button>
              <button onClick={() => setShowConfirm(false)} className="cancel-btn">No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecipeDetail;