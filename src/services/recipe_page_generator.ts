/* eslint-disable no-console */
import { addPage, addElementAtPoint } from "@canva/design";
import type { BoxData, Recipe } from "../types";
import type { TextElementAtPoint, ImageElementAtPoint } from "@canva/design";
import type { ImageRef } from "@canva/asset";

/**
 * Creates placeholder replacement mappings for the frontpage
 * @param boxData - The box data containing frontpage information
 * @returns Object mapping placeholder names to replacement values
 */
export function createFrontpageReplacements(boxData: BoxData): Record<string, string> {
  console.log("Creating frontpage replacements for:", boxData.frontpage);
  const replacements = {
    frontpageTitle: boxData.frontpage.title,
    frontpageIngredients: boxData.frontpage.ingredients.join('\n• '),
  };
  console.log("Frontpage replacements created:", replacements);
  return replacements;
}

/**
 * Creates placeholder replacement mappings for a specific recipe
 * @param recipe - The recipe data
 * @param index - The index of the recipe (0-based)
 * @returns Object mapping placeholder names to replacement values
 */
export function createRecipeReplacements(recipe: Recipe, index: number): Record<string, string> {
  const recipeNumber = index + 1;
  console.log(`Creating recipe replacements for recipe ${recipeNumber}:`, recipe);
  const replacements = {
    [`recipeTitle_${recipeNumber}`]: recipe.title,
    [`recipeDay_${recipeNumber}`]: recipe.day.toString(),
    [`recipeIngredients_${recipeNumber}`]: recipe.ingredients.join('\n• '),
  };
  console.log(`Recipe ${recipeNumber} replacements created:`, replacements);
  return replacements;
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
  console.log("Creating all recipe replacements for recipes:", recipes);
  const allSimple: Record<string, string> = {};
  const allFormatted: Record<string, { headers: string[]; content: string[] }> = {};

  recipes.forEach((recipe, index) => {
    console.log(`Processing recipe ${index + 1}:`, recipe);
    const recipeReplacements = createRecipePageReplacements(recipe, index);
    Object.assign(allSimple, recipeReplacements.simple);
    Object.assign(allFormatted, recipeReplacements.formatted);
  });

  const result = {
    simple: allSimple,
    formatted: allFormatted
  };
  console.log("All recipe replacements created:", result);
  return result;
}

/**
 * Creates a new page with recipe content including images
 * @param recipe - The recipe data to populate the page with
 * @param index - The index of the recipe (0-based)
 * @param imageRefs - Optional array of image references to include
 * @returns Promise that resolves when the page is created
 */
export async function createRecipePage(
  recipe: Recipe, 
  index: number, 
  imageRefs?: ImageRef[]
): Promise<void> {
  const recipeNumber = index + 1;
  console.log(`Creating page for recipe ${recipeNumber}:`, recipe.title);

  const elements: (TextElementAtPoint | ImageElementAtPoint)[] = [
    // Recipe title
    {
      type: 'text',
      children: [recipe.title],
      top: 50,
      left: 100,
      width: 500,
      fontSize: 32,
      fontWeight: 'bold',
      textAlign: 'center'
    },
    // Day indicator
    {
      type: 'text',
      children: [`Day ${recipe.day}`],
      top: 100,
      left: 100,
      width: 500,
      fontSize: 18,
      fontWeight: 'medium',
      textAlign: 'center',
      color: '#666666'
    }
  ];

  // Add main recipe image if available
  if (imageRefs && imageRefs.length > 0) {
    elements.push({
      type: 'image',
      ref: imageRefs[0], // Use first image as main recipe image
      altText: { text: `${recipe.title} - Main Image`, decorative: false },
      top: 130,
      left: 200,
      width: 300,
      height: 200
    });
  }

  // Add ingredients section
  elements.push(
    {
      type: 'text',
      children: ['Ingredients:'],
      top: 350,
      left: 100,
      width: 500,
      fontSize: 20,
      fontWeight: 'semibold',
      color: '#333333'
    },
    {
      type: 'text',
      children: [recipe.ingredients.join('\n• ')],
      top: 380,
      left: 120,
      width: 460,
      fontSize: 16,
      textAlign: 'start'
    }
  );

  // Add method section
  elements.push(
    {
      type: 'text',
      children: ['Method:'],
      top: 550,
      left: 100,
      width: 500,
      fontSize: 20,
      fontWeight: 'semibold',
      color: '#333333'
    },
    {
      type: 'text',
      children: [formatMethodSteps(recipe.method)],
      top: 580,
      left: 120,
      width: 460,
      fontSize: 16,
      textAlign: 'start'
    }
  );

  // Add additional images if available (smaller, positioned differently)
  if (imageRefs && imageRefs.length > 1) {
    for (let i = 1; i < Math.min(imageRefs.length, 3); i++) {
      elements.push({
        type: 'image',
        ref: imageRefs[i],
        altText: { text: `${recipe.title} - Image ${i + 1}`, decorative: false },
        top: 130 + (i * 70), // Stack additional images vertically
        left: 50,
        width: 120,
        height: 80
      });
    }
  }

  try {
    await addPage({
      title: recipe.title,
      elements
    });
    console.log(`Successfully created page for recipe ${recipeNumber}: ${recipe.title}`);
  } catch (error) {
    console.error(`Failed to create page for recipe ${recipeNumber} (${recipe.title}):`, error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }
    throw error;
  }
}

/**
 * Creates pages for all recipes in a box
 * @param recipes - Array of recipe data
 * @param imageRefs - Optional array of image references for all recipes
 * @returns Promise that resolves when all pages are created
 */
export async function createAllRecipePages(
  recipes: Recipe[], 
  imageRefs?: ImageRef[]
): Promise<void> {
  console.log(`Creating pages for ${recipes.length} recipes`);
  
  let successCount = 0;
  let failCount = 0;
  
  for (let i = 0; i < recipes.length; i++) {
    try {
      console.log(`Creating page ${i + 1}/${recipes.length} for recipe: ${recipes[i].title}`);
      
      // Get images for this specific recipe (if imageRefs provided)
      const recipeImages = imageRefs ? [imageRefs[i]] : undefined;
      
      await createRecipePage(recipes[i], i, recipeImages);
      successCount++;
      console.log(`Successfully created page ${i + 1}/${recipes.length}`);
      
      // Add a longer delay to prevent API rate limiting
      if (i < recipes.length - 1) { // Don't delay after the last recipe
        console.log("Waiting before creating next page...");
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      failCount++;
      console.error(`Failed to create page ${i + 1}/${recipes.length} for recipe "${recipes[i].title}":`, error);
      // Continue with other recipes even if one fails
    }
  }
  
  console.log(`Completed creating pages: ${successCount} successful, ${failCount} failed out of ${recipes.length} recipes`);
  
  if (failCount > 0) {
    throw new Error(`Failed to create ${failCount} out of ${recipes.length} recipe pages`);
  }
}

/**
 * Populates the current page with front page content
 * @param boxData - The box data containing frontpage information
 * @returns Promise that resolves when the current page is populated
 */
export async function populateCurrentPageWithFrontPage(boxData: BoxData): Promise<void> {
  console.log("Populating current page with front page content:", boxData.frontpage.title);

  const elements: TextElementAtPoint[] = [
    // Main title
    {
      type: 'text',
      children: [boxData.frontpage.title],
      top: 100,
      left: 100,
      width: 500,
      fontSize: 36,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#2C3E50'
    },
    // Subtitle
    {
      type: 'text',
      children: ['Recipe Box Contents'],
      top: 160,
      left: 100,
      width: 500,
      fontSize: 20,
      fontWeight: 'medium',
      textAlign: 'center',
      color: '#7F8C8D'
    },
    // Ingredients list
    {
      type: 'text',
      children: ['Box Ingredients:'],
      top: 220,
      left: 100,
      width: 500,
      fontSize: 18,
      fontWeight: 'semibold',
      color: '#34495E'
    },
    {
      type: 'text',
      children: [boxData.frontpage.ingredients.join('\n• ')],
      top: 250,
      left: 120,
      width: 460,
      fontSize: 16,
      textAlign: 'start'
    }
  ];

  try {
    // Add each element to the current page
    for (const element of elements) {
      await addElementAtPoint(element);
      // Small delay between elements to prevent API rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    console.log("Successfully populated current page with front page content");
  } catch (error) {
    console.error("Failed to populate current page with front page content:", error);
    throw error;
  }
}

/**
 * Creates a front page with box information
 * @param boxData - The box data containing frontpage information
 * @returns Promise that resolves when the front page is created
 */
export async function createFrontPage(boxData: BoxData): Promise<void> {
  console.log("Creating front page for:", boxData.frontpage.title);

  const elements: TextElementAtPoint[] = [
    // Main title
    {
      type: 'text',
      children: [boxData.frontpage.title],
      top: 100,
      left: 100,
      width: 500,
      fontSize: 36,
      fontWeight: 'bold',
      textAlign: 'center',
      color: '#2C3E50'
    },
    // Subtitle
    {
      type: 'text',
      children: ['Recipe Box Contents'],
      top: 160,
      left: 100,
      width: 500,
      fontSize: 20,
      fontWeight: 'medium',
      textAlign: 'center',
      color: '#7F8C8D'
    },
    // Ingredients list
    {
      type: 'text',
      children: ['Box Ingredients:'],
      top: 220,
      left: 100,
      width: 500,
      fontSize: 18,
      fontWeight: 'semibold',
      color: '#34495E'
    },
    {
      type: 'text',
      children: [boxData.frontpage.ingredients.join('\n• ')],
      top: 250,
      left: 120,
      width: 460,
      fontSize: 16,
      textAlign: 'start'
    }
  ];

  try {
    await addPage({
      title: `${boxData.frontpage.title} - Front Page`,
      elements
    });
    console.log("Successfully created front page");
  } catch (error) {
    console.error("Failed to create front page:", error);
    throw error;
  }
}

/**
 * Creates a complete recipe book with front page and all recipe pages
 * @param boxData - The box data containing frontpage information
 * @param recipes - Array of recipe data
 * @param imageRefs - Optional array of image references for recipes
 * @returns Promise that resolves when all pages are created
 */
export async function createCompleteRecipeBook(
  boxData: BoxData, 
  recipes: Recipe[], 
  imageRefs?: ImageRef[]
): Promise<void> {
  console.log(`Creating complete recipe book with ${recipes.length + 1} pages`);
  console.log("Strategy: Populate current page with front page, then add recipe pages");
  console.log(`Images provided: ${imageRefs ? imageRefs.length : 0}`);
  
  try {
    // Step 1: Populate the current (empty) page with front page content
    console.log("Step 1: Populating current page with front page content...");
    await populateCurrentPageWithFrontPage(boxData);
    console.log("Current page populated successfully");
    
    // Add delay before creating recipe pages
    console.log("Waiting before creating recipe pages...");
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Step 2: Create recipe pages (these will be added after the current page)
    console.log("Step 2: Creating recipe pages...");
    await createAllRecipePages(recipes, imageRefs);
    console.log("Recipe pages created successfully");
    
    console.log("Successfully created complete recipe book");
  } catch (error) {
    console.error("Failed to create complete recipe book:", error);
    throw error;
  }
}
