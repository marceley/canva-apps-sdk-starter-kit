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
  createRecipePageReplacements 
} from "./services/recipe_page_generator";
import { addPage, getDesignMetadata } from "@canva/design";
import { CanvaError } from "@canva/error";

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
    try {
      const boxesData = await fetchBoxes();
      setBoxes(boxesData);
    } catch (err) {
      setError("Failed to load boxes");
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    if (!selectedBox || !selectedWeek) {
      setError("Please select both a box and a week");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const data = await fetchBoxData(selectedBox, selectedWeek);
      setBoxData(data);
    } catch (err) {
      setError("Failed to fetch recipe data");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const createRecipeDocument = async () => {
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
      if (!selectedBoxData) {
        throw new Error("Selected box not found");
      }

      // Get design metadata to check if we can add pages
      const { defaultPageDimensions } = await getDesignMetadata();
      if (!defaultPageDimensions) {
        throw new Error("Cannot add pages in this design type");
      }

      // Process frontpage (current page) - replace placeholders
      const frontpageReplacements = createFrontpageReplacements(boxData);
      await replacePlaceholders(frontpageReplacements);

      // Create pages for each recipe
      for (const recipe of boxData.recipes) {
        // Add a new page for this recipe
        await addPage({
          title: `Recipe ${recipe.day}: ${recipe.title}`,
          elements: [], // Empty page - template will be populated by text replacement
        });

        // Replace placeholders in the new recipe page
        const recipeReplacements = createRecipePageReplacements(recipe);
        await replacePlaceholdersWithFormatting(
          recipeReplacements.simple,
          recipeReplacements.formatted
        );
      }

      setSuccess(`Successfully created recipe document with ${boxData.recipes.length} recipes!`);
    } catch (err) {
      if (err instanceof CanvaError) {
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
            <Text>
              <strong>Ingredients:</strong>
              <ul>
                {boxData.frontpage.ingredients.map((ingredient, index) => (
                  <li key={index}>{ingredient}</li>
                ))}
              </ul>
            </Text>

            <Title size="small">Recipes</Title>
            {boxData.recipes.map((recipe) => (
              <Rows key={recipe.id} spacing="0.5u">
                <Text variant="bold">{recipe.title}</Text>
                <Text size="small">
                  <ul>
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </Text>
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
