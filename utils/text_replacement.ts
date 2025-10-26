/* eslint-disable no-console */
import { editContent } from "@canva/design";

/**
 * Replaces placeholder text patterns in all text elements on the current page
 * @param replacements - Object mapping placeholder patterns to replacement values
 * @returns Promise that resolves when all replacements are complete
 */
export async function replacePlaceholders(
  replacements: Record<string, string>
): Promise<void> {
  console.log("Replacing placeholders with:", replacements);
  await editContent(
    {
      contentType: "richtext",
      target: "current_page",
    },
    async (session) => {
      console.log("Text replacement session started, processing", session.contents.length, "text ranges");
      if (session.contents.length === 0) {
        console.log("WARNING: No text content found on current page! Make sure you're on a page with text elements containing placeholders.");
        return;
      }
      // Process each text range in the session
      for (const range of session.contents) {
        const originalText = range.readPlaintext();
        console.log("Original text:", originalText);
        console.log("Text length:", originalText.length);
        console.log("Looking for placeholders in text...");
        let updatedText = originalText;

        // Replace all placeholder patterns
        for (const [placeholder, replacement] of Object.entries(replacements)) {
          const pattern = new RegExp(`\\{\\{${placeholder}\\}\\}`, "g");
          const matches = updatedText.match(pattern);
          console.log(`Checking for placeholder {{${placeholder}}} in text:`, updatedText.includes(`{{${placeholder}}}`));
          console.log(`Regex pattern:`, pattern);
          if (matches) {
            console.log(`Found ${matches.length} matches for placeholder {{${placeholder}}}, replacing with:`, replacement);
            updatedText = updatedText.replace(pattern, replacement);
          } else {
            console.log(`No matches found for placeholder {{${placeholder}}}`);
          }
        }

        // Only update if text has changed
        if (updatedText !== originalText) {
          console.log("Text updated from:", originalText, "to:", updatedText);
          const length = originalText.length;
          range.replaceText({ index: 0, length }, updatedText);
        } else {
          console.log("No changes needed for this text range");
        }
      }

      // Commit all changes
      console.log("Committing text replacement changes...");
      await session.sync();
      console.log("Text replacement completed on current page");
    }
  );
}

/**
 * Replaces placeholder text patterns with formatted content (supports bold headers)
 * @param replacements - Object mapping placeholder patterns to replacement values
 * @param formattedReplacements - Object mapping placeholder patterns to formatted content with headers
 * @returns Promise that resolves when all replacements are complete
 */
export async function replacePlaceholdersWithFormatting(
  replacements: Record<string, string>,
  formattedReplacements: Record<string, { headers: string[]; content: string[] }>
): Promise<void> {
  console.log("Replacing placeholders with formatting - simple:", replacements);
  console.log("Replacing placeholders with formatting - formatted:", formattedReplacements);
  await editContent(
    {
      contentType: "richtext",
      target: "current_page",
    },
    async (session) => {
      console.log("Formatted text replacement session started, processing", session.contents.length, "text ranges");
      if (session.contents.length === 0) {
        console.log("WARNING: No text content found on current page! Make sure you're on a page with text elements containing placeholders.");
        return;
      }
      // Process each text range in the session
      for (const range of session.contents) {
        const originalText = range.readPlaintext();
        console.log("Original text:", originalText);
        console.log("Text length:", originalText.length);
        console.log("Looking for placeholders in text...");
        let updatedText = originalText;

        // First, replace simple text placeholders
        for (const [placeholder, replacement] of Object.entries(replacements)) {
          const pattern = new RegExp(`\\{\\{${placeholder}\\}\\}`, "g");
          const matches = updatedText.match(pattern);
          console.log(`Checking for simple placeholder {{${placeholder}}} in text:`, updatedText.includes(`{{${placeholder}}}`));
          console.log(`Regex pattern:`, pattern);
          if (matches) {
            console.log(`Found ${matches.length} matches for simple placeholder {{${placeholder}}}, replacing with:`, replacement);
            updatedText = updatedText.replace(pattern, replacement);
          } else {
            console.log(`No matches found for simple placeholder {{${placeholder}}}`);
          }
        }

        // Then handle formatted replacements
        for (const [placeholder, formatted] of Object.entries(formattedReplacements)) {
          const pattern = new RegExp(`\\{\\{${placeholder}\\}\\}`, "g");
          if (updatedText.includes(`{{${placeholder}}}`)) {
            console.log(`Found formatted placeholder ${placeholder}, replacing with formatted content`);
            // Replace the placeholder with formatted content
            const formattedText = formatMethodSteps(formatted.headers, formatted.content);
            console.log("Formatted text:", formattedText);
            updatedText = updatedText.replace(pattern, formattedText);
          }
        }

        // Only update if text has changed
        if (updatedText !== originalText) {
          console.log("Text updated from:", originalText, "to:", updatedText);
          const length = originalText.length;
          range.replaceText({ index: 0, length }, updatedText);
        } else {
          console.log("No changes needed for this text range");
        }
      }

      // Commit all changes
      console.log("Committing formatted text replacement changes...");
      await session.sync();
      console.log("Formatted text replacement completed on current page");
    }
  );
}

/**
 * Formats method steps with bold headers and normal text content
 * @param headers - Array of header text (optional for each step)
 * @param content - Array of content text for each step
 * @returns Formatted text with headers in bold and double newlines between steps
 */
function formatMethodSteps(headers: string[], content: string[]): string {
  const steps: string[] = [];
  
  for (let i = 0; i < content.length; i++) {
    const step: string[] = [];
    
    // Add header if it exists for this step
    if (headers[i] && headers[i].trim()) {
      step.push(`**${headers[i]}**`);
    }
    
    // Add content
    step.push(content[i]);
    
    // Join header and content for this step
    steps.push(step.join('\n'));
  }
  
  // Join all steps with double newlines
  return steps.join('\n\n');
}
