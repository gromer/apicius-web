import OpenAI from 'openai';
import { supabase } from './supabase';

class OpenAIService {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
      dangerouslyAllowBrowser: true
    });
  }

  private async trackUsage(
    usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number },
    importType: 'image' | 'text',
    model: string,
    userId?: string
  ) {
    try {
      const { error } = await supabase
        .from('openai_usage')
        .insert([{
          user_id: userId || null,
          import_type: importType,
          model,
          prompt_tokens: usage.prompt_tokens,
          completion_tokens: usage.completion_tokens,
          total_tokens: usage.total_tokens
        }]);

      if (error) {
        console.error('Failed to track OpenAI usage:', error);
      }
    } catch (err) {
      console.error('Failed to track OpenAI usage:', err);
    }
  }

  private getResponseFormat(format: 'text' | 'json_schema' = 'text') {
    if (format === 'json_schema') {
      return {
        "type": "json_schema",
        "json_schema": {
          "name": "recipe",
          "strict": false,
          "schema": {
            "$schema": "https://json-schema.org/draft/2020-12/schema",
            "$id": "https://example.com/schemas/recipe.json",
            "title": "Recipe",
            "type": "object",
            "properties": {
              "name": {
                "type": "string",
                "description": "The name of the recipe"
              },
              "description": {
                "type": "string",
                "description": "A detailed description of the recipe"
              },
              "prepTime": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "duration",
                "description": "Preparation time in ISO 8601 duration format"
              },
              "cookTime": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "duration",
                "description": "Cooking time in ISO 8601 duration format"
              },
              "totalTime": {
                "type": [
                  "string",
                  "null"
                ],
                "format": "duration",
                "description": "Total time to prepare the recipe in ISO 8601 duration format"
              },
              "servings": {
                "type": "integer",
                "minimum": 1,
                "description": "The number of servings the recipe makes"
              },
              "servingUnit": {
                "type": "string",
                "description": "Unit of measurement for the servings"
              },
              "starRating": {
                "type": [
                  "number",
                  "null"
                ],
                "minimum": 0,
                "maximum": 5,
                "description": "Star rating for the recipe (0 to 5 scale)"
              },
              "imageUrl": {
                "type": "string",
                "format": "uri",
                "description": "URL of the recipe image"
              },
              "ingredients": {
                "type": "array",
                "description": "List of ingredients used in the recipe",
                "items": {
                  "$ref": "#/$defs/Ingredient"
                }
              },
              "instructions": {
                "type": "array",
                "description": "Step-by-step instructions for preparing the recipe",
                "items": {
                  "$ref": "#/$defs/Instruction"
                }
              },
              "categories": {
                "type": "array",
                "description": "Categories that the recipe belongs to",
                "items": {
                  "$ref": "#/$defs/Category"
                }
              },
              "notes": {
                "type": "array",
                "description": "Additional notes or tips for the recipe",
                "items": {
                  "$ref": "#/$defs/Note"
                }
              },
              "tags": {
                "type": "array",
                "description": "Tags associated with the recipe",
                "items": {
                  "$ref": "#/$defs/Tag"
                }
              }
            },
            "required": [
              "name",
              "description",
              "servings",
              "servingUnit",
              "ingredients",
              "instructions",
              "categories",
              "notes",
              "tags"
            ],
            "additionalProperties": false,
            "$defs": {
              "Ingredient": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string"
                  },
                  "quantity": {
                    "type": "number"
                  },
                  "unit": {
                    "type": "string"
                  }
                },
                "required": [
                  "name",
                  "quantity",
                  "unit"
                ],
                "additionalProperties": false
              },
              "Instruction": {
                "type": "object",
                "properties": {
                  "description": {
                    "type": "string"
                  },
                  "stepNumber": {
                    "type": "integer"
                  },
                  "timeEstimate": {
                    "type": [
                      "string",
                      "null"
                    ],
                    "format": "duration"
                  }
                },
                "required": [
                  "description",
                  "stepNumber"
                ],
                "additionalProperties": false
              },
              "Category": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string"
                  }
                },
                "required": [
                  "name"
                ],
                "additionalProperties": false
              },
              "Note": {
                "type": "object",
                "properties": {
                  "text": {
                    "type": "string"
                  },
                  "order": {
                    "type": "integer"
                  }
                },
                "required": [
                  "text",
                  "order"
                ],
                "additionalProperties": false
              },
              "Tag": {
                "type": "object",
                "properties": {
                  "name": {
                    "type": "string"
                  }
                },
                "required": [
                  "name"
                ],
                "additionalProperties": false
              }
            }
          }
        }
      };
    }
    return { "type": "text" };
  }

  private getSystemMessage(messageType: 'image-to-md' | 'text-to-md' | 'md-to-json') {
    switch (messageType) {
      case 'md-to-json':
        return `
You are an AI assistant that converts recipes from markdown syntax to json using the specified json schema. You will receive a a recipe in markdown syntax. Your task is to read and parse the markdown into a json. Only use the data in the input markdown to generate the json. If something isn't defined in the markdown, do not generate values for it.
`;
      case 'image-to-md':
      case 'text-to-md':
        return `
# Chef Persona
## Instruction
You are a skilled and passionate chef who loves exploring global cuisines. You excel at instructing young cooks in the art of meal preparation. Your role is to guide chefs in transforming input recipes into delightful dishes by implementing a structured approach. The input recipes may be in text or image form. When multiple recipe images are provided, they are parts of the same recipe that need to be combined into a single, complete recipe.
## Task
When presented with a recipe (either as text or as one or more images), follow these steps to provide a comprehensive yet concise guide for young chefs:
1. **Name**
  - If a recipe name is extracted from the input recipe, it should be used.
  - If no recipe name is extracted from the input recipe, provide a name for the recipe.
  - The name should be rendered in markdown as an H1 using the # syntax.
  - Examples:
    - # The Recipe Name
    - # Gluten Free Pizza Dough
2. **Description**
  - Provide a brief summary of the dish, limited to three or four sentences.
  - Include details about the difficulty level, spiciness, and estimated preparation time if specified in the source.
  - If the recipe includes fermentation, or rise times, include that total time in the description.
  - This section should be rendered in markdown like:
    ## Description:
    {extracted description}
3. **Yield**
  - A yield can have up to three parts: number of servings, serving size, and serving unit.
  - If there is no yield defined in the input recipe, do not output a yield section.
  - A yield must reflect the difference between singular and plural. If the extracted yield is 4 servings, it should display as 4 servings. If the extracted yield is 1 serving, it should display as 1 serving. If the extracted yield is 4 serving, it should be displayed as 4 servings.
  - If a yield is extracted, this section should be rendered in markdown like:
    ## Yield
    {extracted yield}
  - DO NOT GENERATE A HEADER FOR THIS SECTION
  - Example yields:
    - 3 dough balls
      - "3" is the number of servings
      - No serving size specified
      - "dough balls" is the serving unit
    - 3 280 g dough balls
      - "3" is the number of servings
      - "280 g" is the serving size
      - "dough balls" is the serving unit
    - 8 servings
      - "3" is the number of servings
      - No serving size specified
      - "servings" is the serving unit
    - 16 4 oz granola bars
      - "16" is the number of servings
      - "4 oz" is the serving size
      - "granola bars" is the serving unit
4. **Time Estimates**
  - Provide a time estimate breakdown for the recipe.
  - Possible estimate types:
    - Preparation
    - Cooking
    - Rise
    - Fermentation
    - Pre-heat
  - Preparation and Cooking time estimates are very common in recipes.
  - Rise and Fermentation are not as often in recipes. They are more common in brewing beer, or making dough.
  - Pre-heat times should not be inferred or generated. Pre-heating an oven generally is called out in a recipe, but time estimates for them are not. If the specific time of a pre-heat step is mentioned in an input recipe, it should be shown here.
  - If there is no time for a estimate type, do not render the type.
  - This section should be rendered in markdown like:
    ## Time Estimates
    {extracted time estimates}
5. **Ingredients**
  - Outline all necessary ingredients with precise measurements.
  - The ingredients should use sentence casing.
  - Where called for, group ingredients together in the list. For example, a recipe may specify ingredients for the main meal, and also specify ingredients for a sauce.
  - Ingredients should be ordered in the order that they are called for in the steps of the recipe. When ingredient groupings are used in a recipe, maintain the groupings in the list.
  - Use a bulleted list format for clarity.
  - Use the Abbreviations for measurements based on the data in this table, ensuring that text casing follows the format in the table:
    | Measurement Name | Abbreviation | Type  Notes |
    |-|-|-|-|
    | Teaspoon | tsp | Imperial | Lowercase "tsp" is standard |
    | Tablespoon | Tbsp | Imperial | Capital "Tbsp" is preferred |
    | Fluid Ounce | fl oz | Imperial | 1 fl oz ≈ 29.5735 mL |
    | Cup | cup | Imperial | 1 cup = 240 mL |
    | Pint | pt | Imperial | 1 pt = 473.176 mL ≈ 0.47 L |
    | Quart | qt | Imperial | 1 qt = 0.946 L |
    | Gallon | gal | Imperial | 1 gal = 3.785 L |
    | Ounce (Weight) | oz | Imperial | 1 oz ≈ 28.3495 g |
    | Pound | lb | Imperial | 1 lb = 0.453592 kg |
    | Milliliter | mL | Metric | Preferred lowercase "mL" |
    | Liter | L | Metric | Capital "L" is standard |
    | Gram | g | Metric | Lowercase "g" is standard |
    | Kilogram | kg | Metric | Lowercase "kg" is standard |
  - It is important to follow the casing outlined here. When a measurement on an input recipe is a tablespoon (or any variant of an abbreviation for tablespoon), it should only ever render in the markdown as Tbsp, and never tbsp. The same rules apply to the metric Liter measurement. Whenever a Liter is in a measurement the L should always be capitalized. Examples:
    - Input: 5 tablespoons
    - Output: 5 Tbsp
    - Input: 5 tbsp
    - Output: 5 Tbsp
    - Input: 5 TEASPOONS
    - Output: 5 tsp
    - Input: 300 ml
    - Output: 300 mL
    - Input: 1 liter
    - Output: 1 L
  - This section should be rendered in markdown like:
    ## Ingredients
    - 2 Tbsp Safflower Oil
    - 1 tsp salt
    - 3/4 cups flour
    - 1 cup shredded coconut
    ### Ingredient Group
    - Grouped ingredient 1
    - Grouped ingredient 2
6. **Instructions**
  - Detail the step-by-step process required to prepare the dish.
  - Employ a numbered list for the steps instead of bullet points.
  - This section should be rendered in markdown like:
    ## Instructions
    1. Instruction step 1.
    2. Instruction step 2.
    3. Instruction step 3.
7. **Notes**
  - Any additional notes that are extracted from the input recipe can be outlined here.
  - Use a bulleted list format for clarity.
  - This section should be rendered in markdown like:
    ## Notes
    1. Note 1.
    2. Note 2.
    3. Note 3.
## Output Format
- Ensure that your response is entirely in Markdown format.
- Do not use inline code blocks.
- Do not use fenced code blocks.
- Adhere strictly to the provided measurements; do not modify them.
- Do not abbreviate ingredient names. Examples:
  - DO: salt and pepper
  - DO NOT: s and p
  - DO: Extra Virgin Olive Oil
  - DO NOT: EVOO
- Emphasize variety in expression while maintaining clarity and precision.
### Example Usage
When given a recipe or description of a dish, proceed with the structure above to guide young chefs effectively in crafting the meal.
`;
    }
  }
  
  async *extractRecipeFromImage(
    base64Images: string[],
    streamResponse: boolean = true,
    userId?: string
  ): AsyncGenerator<string> {
    const model = import.meta.env.VITE_OPENAI_MODEL || 'gpt-4o-mini';
    const stream = await this.client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: this.getSystemMessage('image-to-md')
        },
        {
          role: "user",
          content: base64Images.map(base64Image => ({
            type: "image_url",
            image_url: {
              url: `data:image/jpeg;base64,${base64Image}`
            }
          }))
        }
      ],
      response_format: { type: "text" },
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: streamResponse
    });

    // Track usage after getting the response
    if (!streamResponse && stream.usage) {
      await this.trackUsage(stream.usage, 'image', model, userId);
    }

    if (streamResponse) {
      let fullResponse = '';
      for await (const chunk of stream) {
        if (chunk.choices[0]?.delta?.content) {
          fullResponse += chunk.choices[0].delta.content;
          yield chunk.choices[0].delta.content;
        }
      }
      // For streaming responses, we need to make a separate call to get usage data
      const finalResponse = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: this.getSystemMessage('image-to-md')
          },
          {
            role: "user",
            content: base64Images.map(base64Image => ({
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }))
          }
        ],
        response_format: { type: "text" },
        temperature: 1,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false
      });

      if (finalResponse.usage) {
        await this.trackUsage(finalResponse.usage, 'image', model, userId);
      }
    } else {
      yield stream.choices[0]?.message?.content || '';
    }
  }

  async *extractRecipeFromText(
    text: string, 
    responseFormat: 'text' | 'json_schema' = 'text',
    streamResponse: boolean = true,
    userId?: string
  ): AsyncGenerator<string> {
    const model = import.meta.env.VITE_OPENAI_TEXT_MODEL || 'gpt-4o-mini';
    const response = await this.client.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content: this.getSystemMessage(responseFormat === 'json_schema' ? 'md-to-json' : 'text-to-md')
        },
        {
          role: "user",
          content: text
        }
      ],
      response_format: this.getResponseFormat(responseFormat),
      temperature: 1,
      max_tokens: 2048,
      top_p: 1,
      frequency_penalty: 0,
      presence_penalty: 0,
      stream: streamResponse
    });

    // Track usage after getting the response
    if (!streamResponse && response.usage) {
      await this.trackUsage(response.usage, 'text', model, userId);
    }

    if (streamResponse) {
      let fullResponse = '';
      for await (const chunk of response) {
        if (chunk.choices[0]?.delta?.content) {
          fullResponse += chunk.choices[0].delta.content;
          yield chunk.choices[0].delta.content;
        }
      }
      // For streaming responses, we need to make a separate call to get usage data
      const finalResponse = await this.client.chat.completions.create({
        model,
        messages: [
          {
            role: "system",
            content: this.getSystemMessage(responseFormat === 'json_schema' ? 'md-to-json' : 'text-to-md')
          },
          {
            role: "user",
            content: text
          }
        ],
        response_format: this.getResponseFormat(responseFormat),
        temperature: 1,
        max_tokens: 2048,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0,
        stream: false
      });

      if (finalResponse.usage) {
        await this.trackUsage(finalResponse.usage, 'text', model, userId);
      }
    } else {
      yield response.choices[0]?.message?.content || '';
    }
  }
}

export const openAIService = new OpenAIService();