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

export const App = () => {
  const [boxes, setBoxes] = useState<Box[]>([]);
  const [weeks, setWeeks] = useState<WeekOption[]>([]);
  const [selectedBox, setSelectedBox] = useState<string>("");
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [boxData, setBoxData] = useState<BoxData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");

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
                <Text variant="bold">{recipe.name}</Text>
                <Text size="small">
                  <ul>
                    {recipe.ingredients.map((ingredient, index) => (
                      <li key={index}>{ingredient}</li>
                    ))}
                  </ul>
                </Text>
              </Rows>
            ))}
          </Rows>
        )}
      </Rows>
    </div>
  );
};
