import { GoogleGenAI, Type } from "@google/genai";
import type { RawPackingCategory, PackingList, RawPackingItem } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const packingListSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      category: {
        type: Type.STRING,
        description: 'The category of packing items, e.g., "Clothing", "Electronics", "Documents", "Toiletries".',
      },
      items: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: 'The name of the individual item to pack, e.g., "Passport", "Phone charger", "Rain jacket". Should be concise.',
            },
            source: {
              type: Type.STRING,
              enum: ['user', 'ai'],
              description: "The origin of the item. 'user' for items from the user's base list, 'ai' for items suggested by the AI."
            }
          },
          required: ['name', 'source'],
        },
        description: 'A list of items belonging to this category.',
      },
    },
    required: ['category', 'items'],
  },
};

export const selectRelevantTemplates = async (tripDescription: string, templateNames: string[]): Promise<string[]> => {
  try {
    const prompt = `Based on the following trip description, identify which of the predefined packing list templates are relevant.

Trip Description: "${tripDescription}"

Available Packing Templates:
${templateNames.join('\n')}

- The "תמיד" template should be included for almost any trip away from home.
- You must respond with a JSON array containing only the names of the relevant packing templates from the provided list.
- If no specific templates seem to match, return an array with just "תמיד".
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        },
        systemInstruction: "You are an assistant that helps select relevant packing list templates based on a trip description. Your output must be a valid JSON array of strings.",
      },
    });

    const jsonText = response.text.trim();
    const parsedList = JSON.parse(jsonText);
    if (!Array.isArray(parsedList) || !parsedList.every(item => typeof item === 'string')) {
      throw new Error("API did not return a valid array of strings.");
    }
    return parsedList as string[];
  } catch (error) {
    console.error("Error selecting relevant templates:", error);
    // Fallback to the 'Always' list in case of error
    return ["תמיד"];
  }
};


export const generatePackingList = async (tripDescription: string, coreList: RawPackingCategory[]): Promise<RawPackingCategory[]> => {
  try {
    const coreListString = JSON.stringify(coreList, null, 2);
    const prompt = `You are an expert trip planner. Your task is to augment a user's existing packing list with items relevant to their specific trip.

Here is the user's trip description:
"${tripDescription}"

And here is the user's pre-selected, relevant packing list based on their personal templates:
\`\`\`json
${coreListString}
\`\`\`

Based on the trip description, generate a list of **only the additional items** they might need.
- **DO NOT** repeat any items already present in the user's list.
- Organize the suggestions into logical categories. If a suggested item fits into an existing category, use that category name.
- If a suggested item requires a new category (e.g., "Hiking Gear"), create it.
- Provide your response as a JSON array of categories and items, following the provided schema. If there are no new suggestions, return an empty array [].`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: packingListSchema,
        systemInstruction: "You are an expert trip planner AI that helps users complete their packing lists by suggesting additional items based on their trip description and existing list.",
      },
    });

    const jsonText = response.text.trim();
    // Handle empty response for cases where no new items are needed
    if (jsonText === "") return [];

    const parsedList = JSON.parse(jsonText);
    
    if (!Array.isArray(parsedList)) {
        throw new Error("API did not return a valid list format.");
    }

    // Ensure source is set to 'ai' for all generated items
    const resultWithSource = parsedList.map(category => ({
        ...category,
        items: category.items.map((item: RawPackingItem) => ({ ...item, source: 'ai' }))
    }));

    return resultWithSource as RawPackingCategory[];
  } catch (error) {
    console.error("Error generating packing list:", error);
    throw new Error("Failed to generate packing list from Gemini API.");
  }
};

export const refinePackingList = async (refinementRequest: string, currentList: PackingList): Promise<RawPackingCategory[]> => {
  try {
    // Convert the full PackingList to a simpler RawPackingCategory for the prompt
    const simplifiedList: RawPackingCategory[] = currentList.map(cat => ({
      category: cat.category,
      items: cat.items.map(item => ({ name: item.name, source: item.source })),
    }));
    const currentListString = JSON.stringify(simplifiedList, null, 2);

    const prompt = `You are an intelligent packing list assistant. The user wants to modify their current packing list based on a request.

User's Request:
"${refinementRequest}"

Current Packing List (JSON format):
\`\`\`json
${currentListString}
\`\`\`

Your task is to intelligently process the user's request and return the *entire updated packing list* as a JSON object that adheres to the provided schema.

Instructions:
- **Analyze the Request:** Understand if the user wants to add, remove, or modify items or categories.
- **Add Items:** If adding items, place them in the most logical existing category or create a new one if necessary. All newly added items MUST have a \`source\` property set to "ai".
- **Remove Items:** If removing items, delete them from the list completely. Be precise; if the user says "remove sunglasses", only remove that item.
- **Maintain Structure:** Preserve the existing structure. Items that are not part of the request should remain in the list.
- **Preserve Source:** For existing items, keep their original \`source\` property ('user' or 'ai').
- **DO NOT** include \`id\` or \`packed\` properties in your output.
- **Output:** Your response must be the complete, modified list as a valid JSON array of categories and items.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: packingListSchema,
        systemInstruction: "You are a packing list editor AI. You modify a user's packing list based on their text requests and return the full, updated list in JSON format.",
      },
    });

    const jsonText = response.text.trim();
    if (jsonText === "") return simplifiedList; // Return original list if response is empty

    const parsedList = JSON.parse(jsonText);
    
    if (!Array.isArray(parsedList)) {
        throw new Error("API did not return a valid list format for refinement.");
    }
    
    return parsedList as RawPackingCategory[];

  } catch (error) {
    console.error("Error refining packing list:", error);
    throw new Error("Failed to refine packing list from Gemini API.");
  }
};