import { getModel } from "../config/model.js";

export const codingAgent = async (state) => {
  try {
    const llm = await getModel("coding");

    const intentResponse = await llm.invoke(`
You are an intent classifier.

Return ONLY one of these values:

CODE_GENERATION
CODE_REVIEW
CODE_EXPLANATION
DEBUGGING
OPTIMIZATION
CONVERSION
DOCUMENTATION

${state.prompt}
    `);

    const rawIntent = (intentResponse.content || "").toString().trim().toUpperCase();
    console.log("Classified Intent:", rawIntent);

    if (rawIntent.includes("CODE_GENERATION")) {
      const prompt = `
You are an expert AI code generator.

Generate production-ready code.

Return ONLY valid JSON matching this schema.

{
  "title": "string",
  "description": "string",
  "language": "string",
  "dependencies": ["string"],
  "files": [
    {
      "filename": "string",
      "content": "full file code as string"
    }
  ],
  "runInstructions": ["step 1", "step 2"],
  "testInstructions": ["step 1", "step 2"]
}

Rules:
- Return JSON only.
- Do not wrap JSON in markdown or backticks.
- Do not include explanations outside JSON.
- Include complete file contents.

User Request:
${state.prompt}
`;

      const response = await llm.invoke(prompt);
      const rawContent = (response.content || "").toString().trim();

      // Strip markdown code fences if the model wrapped output in ```json ... ```
      const cleanedJson = rawContent
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

      console.log("CODE_GENERATION Output:\n", cleanedJson);

      let artifactData = null;
      try {
        artifactData = JSON.parse(cleanedJson);
      } catch (err) {
        console.warn("Could not parse artifact JSON:", err.message);
      }

      return {
        aiResponse: cleanedJson,
        artifact: artifactData,
        stateAgentKey: "coding",
      };
    }

    // Fallback for other coding intents (review, debug, explanation, etc.)
    const fallbackResponse = await llm.invoke(state.prompt);
    return {
      aiResponse: fallbackResponse.content || "Code processing completed.",
      stateAgentKey: "coding",
    };
  } catch (error) {
    console.error("Coding Agent Error:", error);
    return {
      aiResponse: "I encountered an error while generating code. Please try again.",
      stateAgentKey: "coding",
    };
  }
};