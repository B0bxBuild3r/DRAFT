import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { extractReasoningMiddleware, streamText, wrapLanguageModel } from 'ai';
export async function POST(req: Request) {
  const { messages } = await req.json();
  const openrouter = createOpenRouter({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const arr = messages
  const basePrompt = `
 You are a visionary AAA game developer, specialized in creating fully polished, production-ready browser games with advanced graphics and seamless gameplay. Your task is to deliver a **single, complete HTML document** that can be instantly dropped into an <iframe> and run at release quality. Follow these rules:

1. **Document Structure**  
   - Your output must start with \`<!DOCTYPE html>\` and include all HTML, CSS, and JavaScript in one file.  
   - You may only load external scripts from these CDNs: Three.js, GSAP, Matter.js, Pixi.js, or p5.js.

2. **Production-Ready Quality**  
   - Build a fully functional game with all necessary mechanics, user interactions, feedback systems, and smooth animations.  
   - Whether the user wants "Pac-Man," "Space Invaders," or a custom new concept, the result must be a complete, release-level game.

3. **Assets**  
   - No external image URLs allowed. All images must be embedded via Base64 data URIs or generated procedurally with JavaScript.  
   - Ensure no broken links or dependencies.

4. **Performance & Animation**  
   - Use \`requestAnimationFrame\` for smooth, high-performance updates.  
   - You may use \`localStorage\` if needed to save game progress or settings.

5. **Gameplay & UI**  
   - Include refined user experience with responsive controls, intuitive menus, scoring, levels, and any other required features.  
   - Provide visually appealing, AAA-grade graphics and feedback elements.

6. **Output Format**  
   - Do not provide any explanations, markdown formatting, or code blocks.  
   - **Only** output the self-contained HTML file—start with \`<!DOCTYPE html>\` and include everything needed to run the game immediately.

7. **User Message**  
   - Below is the user’s specific request. Regardless of how short or general it is, produce a fully operational, polished version of that game.

**User Message**: ${arr[arr.length - 1].content} 
  `;

  if (arr.length > 1) {
    arr[arr.length - 1].content = `
Continuing from your previous response, you are still a visionary AAA game developer creating a fully polished, self-contained HTML game. Here are the changes or additions the user wants:

1. <<List the user’s new requests or modifications here>>

2. Remember to follow the same constraints:
   - Output a single, complete HTML file starting with <!DOCTYPE html>.
   - Inline or permitted CDNs only (Three.js, GSAP, Matter.js, Pixi.js, or p5.js).
   - No external image links—use Base64 or procedural images.
   - Use requestAnimationFrame for smooth animations.
   - No extra text, markdown, or code fence blocks.

Please update the game accordingly, ensuring it remains fully functional and ready to paste into an <iframe>.

**User’s Updated Request**: ${arr[arr.length - 1].content}
    `
    arr[arr.length - 1].parts[0].text = arr[arr.length - 1].content;
  } else {
    arr[arr.length - 1].content = basePrompt;
    arr[arr.length - 1].parts[0].text = arr[arr.length - 1].content;
  }



  const model = 'openai/o3-mini'

  const enhancedModel = wrapLanguageModel({
    model: openrouter.chat(model),
    middleware: extractReasoningMiddleware({ tagName: 'think' }),
  });


  const result = streamText({
    model: enhancedModel,
    // model: openrouter.chat(model, {}),
    messages: arr,
    temperature: 0.8,
  });

  return result.toDataStreamResponse({
    sendReasoning: true, // forwards reasoning tokens to the client
  });
}