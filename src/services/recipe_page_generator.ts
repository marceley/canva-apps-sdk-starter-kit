import type { BoxData, Recipe } from "../types";

/**
 * Creates placeholder replacement mappings for the frontpage
 * @param boxData - The box data containing frontpage information
 * @returns Object mapping placeholder names to replacement values
 */
export function createFrontpageReplacements(boxData: BoxData): Record<string, string> {
  return {
    frontpageTitle: boxData.frontpage.title,
    frontpageIngredients: boxData.frontpage.ingredients.join('\n• '),
  };
}

/**
 * Creates placeholder replacement mappings for a specific recipe
 * @param recipe - The recipe data
 * @param index - The index of the recipe (0-based)
 * @returns Object mapping placeholder names to replacement values
 */
export function createRecipeReplacements(recipe: Recipe, index: number): Record<string, string> {
  const recipeNumber = index + 1;
  return {
    [`recipeTitle_${recipeNumber}`]: recipe.title,
    [`recipeDay_${recipeNumber}`]: recipe.day.toString(),
    [`recipeIngredients_${recipeNumber}`]: recipe.ingredients.join('\n• '),
  };
}

/**
 * Creates formatted method replacements for a specific recipe
 * @param recipe - The recipe data
 * @param index - The index of the recipe (0-based)
 * @returns Object mapping placeholder names to formatted content
 */
export function createMethodReplacements(recipe: Recipe, index: number): Record<string, { headers: string[]; content: string[] }> {
  const headers: string[] = [];
  const content: string[] = [];
  
  recipe.method.forEach((step) => {
    headers.push(step.header || '');
    content.push(step.text);
  });
  
  const recipeNumber = index + 1;
  return {
    [`recipeMethod_${recipeNumber}`]: { headers, content }
  };
}

/**
 * Formats method steps with proper spacing and formatting
 * @param method - Array of method steps
 * @returns Formatted method text
 */
export function formatMethodSteps(method: Recipe['method']): string {
  const steps: string[] = [];
  
  method.forEach((step) => {
    const stepParts: string[] = [];
    
    // Add header if it exists
    if (step.header && step.header.trim()) {
      stepParts.push(`**${step.header}**`);
    }
    
    // Add content
    stepParts.push(step.text);
    
    // Join header and content for this step
    steps.push(stepParts.join('\n'));
  });
  
  // Join all steps with double newlines
  return steps.join('\n\n');
}

/**
 * Creates all replacement mappings for a recipe page
 * @param recipe - The recipe data
 * @param index - The index of the recipe (0-based)
 * @returns Object containing both simple and formatted replacements
 */
export function createRecipePageReplacements(recipe: Recipe, index: number): {
  simple: Record<string, string>;
  formatted: Record<string, { headers: string[]; content: string[] }>;
} {
  return {
    simple: createRecipeReplacements(recipe, index),
    formatted: createMethodReplacements(recipe, index)
  };
}

/**
 * Creates all replacement mappings for all recipes in a box
 * @param recipes - Array of recipe data
 * @returns Object containing both simple and formatted replacements for all recipes
 */
export function createAllRecipeReplacements(recipes: Recipe[]): {
  simple: Record<string, string>;
  formatted: Record<string, { headers: string[]; content: string[] }>;
} {
  const allSimple: Record<string, string> = {};
  const allFormatted: Record<string, { headers: string[]; content: string[] }> = {};

  recipes.forEach((recipe, index) => {
    const recipeReplacements = createRecipePageReplacements(recipe, index);
    Object.assign(allSimple, recipeReplacements.simple);
    Object.assign(allFormatted, recipeReplacements.formatted);
  });

  return {
    simple: allSimple,
    formatted: allFormatted
  };
}
