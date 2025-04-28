import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { streamText } from 'ai';

export async function POST(request: Request) {
  const { prompt, conversation } = await request.json()

  if (!process.env.OPENAI_API_KEY) {
    return new Response("API key not found", { status: 500 })
  }

  // Build the messages array (system prompt + conversation history + new prompt)
  const messages = [
    {
      role: "system",
      content: `
Create a fully functional, detailed, and robust web-based video game that runs seamlessly in modern browsers. The game must be self-contained in a single HTML5 file—including all HTML, CSS, and JavaScript—and be ready for immediate use in a browser. The game should be thoroughly tested, free of errors, and work across modern browsers and devices.

- **Concept and Design**: 
  - Select a clear game genre with a defined setting, storyline, and primary mechanics.
  - Design engaging gameplay with interactive elements such as scoring, levels, power-ups, or enemy challenges.
  - Plan and include essential UI components: a main menu, instructions screen, pause functionality, game over screen, and a restart button.

- **Implementation**: 
  - Write clean, well-commented, and well-indented code using modern HTML5, CSS, and JavaScript. All code must reside within one HTML file.
  - You may use game libraries such as Phaser to build more complex games.
  - Include error handling and ensure that any user interactions are fully functional.
  - Optimize the code for performance to provide smooth and responsive gameplay.
  - If the user plays the game with arrow keys, make sure it does not scroll the page when pressing the up or down arrow keys, as this is a bad user experience.

- **User Interface and Experience**: 
  - Create a visually appealing, responsive, and user-friendly interface that adapts to various screen sizes.
  - Implement all necessary UI components with clear, intuitive functionality.
  - Integrate animations and transitions where appropriate to enhance the gaming experience.

- **Testing and Quality Assurance**:
  - Thoroughly test the complete game to ensure all features work as intended.
  - Validate that the code is error-free and that the game launches correctly in a browser.
  - Ensure all UI elements are operational and that the game can be restarted after game over without issues.

# Notes

- Make sure the HTML file functions correctly and contains all necessary components for a complete gaming experience.
- The response must be in pure complete HTML code, directly usable in a browser.
- Do not include MD wrapper such as  \`\`\` HTML.

Output Format:
Return your answer as a valid HTML code. It must be a complete HTML file (starting with <!DOCTYPE html> or <html>) that is directly usable in a browser. Do not include any additional text, markdown formatting (like \`\`\`), or any other keys in your response.

<!DOCTYPE html><html>...</html>

Do not output anything other than HTML that follows the format above.
      `,
    },
    // Include previous conversation messages (if any)
    ...(Array.isArray(conversation) ? conversation : []),
    // Finally, add the new user prompt.
    { role: "user", content: `Do not respond with anything except valid HTML. Do not wrap in a code block.  Here is my prompt: ${prompt}` },
  ]

  const openrouter = createOpenRouter({
    apiKey: process.env.OPENAI_API_KEY,
  });
  
  // Begin streaming from the AI.
  const result = streamText({
    model: openrouter.chat("google/gemini-2.5-flash-preview"),
    messages,
  })

  return new Response(result.toDataStreamResponse().body, {
    headers: { "Content-Type": "text/html" },
  })
}