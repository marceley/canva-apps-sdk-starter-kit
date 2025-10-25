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
 * @returns Object mapping placeholder names to replacement values
 */
export function createRecipeReplacements(recipe: Recipe): Record<string, string> {
  return {
    recipeTitle: recipe.title,
    recipeDay: recipe.day.toString(),
    recipeIngredients: recipe.ingredients.join('\n• '),
  };
}

/**
 * Creates formatted method replacements for a specific recipe
 * @param recipe - The recipe data
 * @returns Object mapping placeholder names to formatted content
 */
export function createMethodReplacements(recipe: Recipe): Record<string, { headers: string[]; content: string[] }> {
  const headers: string[] = [];
  const content: string[] = [];
  
  recipe.method.forEach((step) => {
    headers.push(step.header || '');
    content.push(step.text);
  });
  
  return {
    recipeMethod: { headers, content }
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
 * @returns Object containing both simple and formatted replacements
 */
export function createRecipePageReplacements(recipe: Recipe): {
  simple: Record<string, string>;
  formatted: Record<string, { headers: string[]; content: string[] }>;
} {
  return {
    simple: createRecipeReplacements(recipe),
    formatted: createMethodReplacements(recipe)
  };
}
