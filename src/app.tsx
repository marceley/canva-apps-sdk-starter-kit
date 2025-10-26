/* eslint-disable no-console */
import {
  Button,
  FormField,
  Rows,
  Select,
  Text,
  Title,
  Alert,
} from "@canva/app-ui-kit";
import React, { useEffect, useState } from "react";
import * as styles from "styles/components.css";
import { generateWeeks } from "utils/week_generator";
import { fetchBoxes, fetchBoxData } from "./services/api";
import type { Box, BoxData, WeekOption } from "./types";
import { replacePlaceholders, replacePlaceholdersWithFormatting } from "utils/text_replacement";
import { 
  createFrontpageReplacements, 
  createAllRecipeReplacements 
} from "./services/recipe_page_generator";
import { CanvaError } from "@canva/error";
import { prepareDesignEditor } from "@canva/intents/design";

prepareDesignEditor({
  render: async () => {
    return <App />;
  },
});

export const App = () => {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [weeks, setWeeks] = useState<WeekOption[]>([]);
  const [selectedBox, setSelectedBox] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [boxData, setBoxData] = useState<BoxData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingDocument, setIsCreatingDocument] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  // Load boxes on mount
  useEffect(() => {
    loadBoxes();
    setWeeks(generateWeeks());
  }, []);

  const loadBoxes = async () => {
    console.log("Loading boxes...");
    try {
      const boxesData = await fetchBoxes();
      console.log("Boxes loaded:", boxesData);
      setBoxes(boxesData);
    } catch (err) {
      setError("Failed to load boxes");
      console.error("Error loading boxes:", err);
    }
  };

  const handleSubmit = async () => {
    console.log("Handle submit called with:", { selectedBox, selectedWeek });
    if (!selectedBox || !selectedWeek) {
      setError("Please select both a box and a week");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      console.log("Fetching box data for:", { selectedBox, selectedWeek });
      const data = await fetchBoxData(selectedBox, selectedWeek);
      console.log("Box data fetched:", data);
      setBoxData(data);
    } catch (err) {
      setError("Failed to fetch recipe data");
      console.error("Error fetching box data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const createRecipeDocument = async () => {
    console.log("Creating recipe document with boxData:", boxData);
    if (!boxData || !selectedBox) {
      setError("No recipe data available");
      return;
    }

    setIsCreatingDocument(true);
    setError("");
    setSuccess("");

    try {
      // Get the selected box to access templateId
      const selectedBoxData = boxes.find(box => box.id === selectedBox);
      console.log("Selected box data:", selectedBoxData);
      if (!selectedBoxData) {
        throw new Error("Selected box not found");
      }

      // Process frontpage (current page) - replace placeholders
      console.log("Creating frontpage replacements...");
      const frontpageReplacements = createFrontpageReplacements(boxData);
      console.log("Frontpage replacements:", frontpageReplacements);
      console.log("Frontpage placeholders to look for:", Object.keys(frontpageReplacements).map(key => `{{${key}}}`));
      await replacePlaceholders(frontpageReplacements);
      console.log("Frontpage placeholders replaced");

      // Create all recipe replacements for numbered placeholders
      console.log("Creating all recipe replacements...");
      const allRecipeReplacements = createAllRecipeReplacements(boxData.recipes);
      console.log("All recipe replacements:", allRecipeReplacements);
      console.log("Simple placeholders to look for:", Object.keys(allRecipeReplacements.simple).map(key => `{{${key}}}`));
      console.log("Formatted placeholders to look for:", Object.keys(allRecipeReplacements.formatted).map(key => `{{${key}}}`));
      
      // Replace all recipe placeholders in the current document
      console.log("Replacing recipe placeholders...");
      await replacePlaceholdersWithFormatting(
        allRecipeReplacements.simple,
        allRecipeReplacements.formatted
      );
      console.log("Recipe placeholders replaced");

      setSuccess(`Successfully filled placeholders on current page! Navigate to other pages in your template and run this again to fill all pages.`);
    } catch (err) {
      console.error("Error creating recipe document:", err);
      if (err instanceof CanvaError) {
        console.error("Canva error code:", err.code);
        switch (err.code) {
          case "quota_exceeded":
            setError("Cannot add more pages. Please remove existing pages and try again.");
            break;
          case "rate_limited":
            setError("Rate limited. Please wait a moment and try again.");
            break;
          default:
            setError(`Canva error: ${err.message}`);
            break;
        }
      } else {
        setError(`Failed to create document: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } finally {
      setIsCreatingDocument(false);
    }
  };

  return (
    <div className={styles.scrollContainer}>
      <Title size="large">Recipe Box Selector</Title>

      <Rows spacing="2u">
        <FormField
          label="Select Box"
          value={selectedBox}
          control={(props) => (
            <Select<string>
              {...props}
              options={[
                { value: "", label: "Choose a box...", disabled: true },
                ...boxes.map((box) => ({
                  value: box.id,
                  label: box.label,
                })),
              ]}
              onChange={(value) => {
                setSelectedBox(value);
                setBoxData(null);
              }}
            />
          )}
        />

        <FormField
          label="Select Week"
          value={selectedWeek}
          control={(props) => (
            <Select<string>
              {...props}
              options={[
                { value: "", label: "Choose a week...", disabled: true },
                ...weeks.map((week) => ({
                  value: week.value,
                  label: week.label,
                })),
              ]}
              onChange={(value) => {
                setSelectedWeek(value);
                setBoxData(null);
              }}
            />
          )}
        />

        <Button
          variant="primary"
          onClick={handleSubmit}
          loading={isLoading}
          stretch
        >
          Get Recipes
        </Button>

        {error && <Alert tone="critical" title={error} />}
        {success && <Alert tone="positive" title={success} />}

        {boxData && (
          <Rows spacing="2u">
            <Title size="small">Frontpage</Title>
            <Text variant="bold">{boxData.frontpage.title}</Text>
            <div>
              <Text variant="bold">Ingredients:</Text>
              <ul>
                {boxData.frontpage.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </div>

            <Title size="small">Recipes</Title>
            {boxData.recipes.map((recipe) => (
              <Rows key={recipe.id} spacing="0.5u">
                <Text variant="bold">{recipe.title}</Text>
                <div>
                  <ul>
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </div>
              </Rows>
            ))}

            <Button
              variant="primary"
              onClick={createRecipeDocument}
              loading={isCreatingDocument}
              stretch
            >
              Create Recipe Document
            </Button>
          </Rows>
        )}
      </Rows>
    </div>
  );
};
