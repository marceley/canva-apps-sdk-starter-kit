import { editContent } from "@canva/design";

/**
 * Replaces placeholder text patterns in all text elements on the current page
 * @param replacements - Object mapping placeholder patterns to replacement values
 * @returns Promise that resolves when all replacements are complete
 */
export async function replacePlaceholders(
  replacements: Record<string, string>
): Promise<void> {
  await editContent(
    {
      contentType: "richtext",
      target: "current_page",
    },
    async (session) => {
      // Process each text range in the session
      for (const range of session.contents) {
        const originalText = range.readPlaintext();
        let updatedText = originalText;

        // Replace all placeholder patterns
        for (const [placeholder, replacement] of Object.entries(replacements)) {
          const pattern = new RegExp(`\\{\\{${placeholder}\\}\\}`, "g");
          updatedText = updatedText.replace(pattern, replacement);
        }

        // Only update if text has changed
        if (updatedText !== originalText) {
          const length = originalText.length;
          range.replaceText({ index: 0, length }, updatedText);
        }
      }

      // Commit all changes
      await session.sync();
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
  await editContent(
    {
      contentType: "richtext",
      target: "current_page",
    },
    async (session) => {
      // Process each text range in the session
      for (const range of session.contents) {
        const originalText = range.readPlaintext();
        let updatedText = originalText;

        // First, replace simple text placeholders
        for (const [placeholder, replacement] of Object.entries(replacements)) {
          const pattern = new RegExp(`\\{\\{${placeholder}\\}\\}`, "g");
          updatedText = updatedText.replace(pattern, replacement);
        }

        // Then handle formatted replacements
        for (const [placeholder, formatted] of Object.entries(formattedReplacements)) {
          const pattern = new RegExp(`\\{\\{${placeholder}\\}\\}`, "g");
          if (updatedText.includes(`{{${placeholder}}}`)) {
            // Replace the placeholder with formatted content
            const formattedText = formatMethodSteps(formatted.headers, formatted.content);
            updatedText = updatedText.replace(pattern, formattedText);
          }
        }

        // Only update if text has changed
        if (updatedText !== originalText) {
          const length = originalText.length;
          range.replaceText({ index: 0, length }, updatedText);
        }
      }

      // Commit all changes
      await session.sync();
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
