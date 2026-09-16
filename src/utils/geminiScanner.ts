export interface GeminiScanResult {
  corners: {
    topLeft: { x: number; y: number };
    topRight: { x: number; y: number };
    bottomRight: { x: number; y: number };
    bottomLeft: { x: number; y: number };
  } | null;
  text: string;
}

export async function processImageWithGemini(base64Image: string, apiKey: string, mode: 'doc' | 'question'): Promise<GeminiScanResult> {
  // Remove the data URI prefix if it exists
  const base64Data = base64Image.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

  const promptText = mode === 'question' 
    ? `You are an AI document scanner. I have provided an image of a document or question.
1. Find the coordinates of the 4 corners of the exact question or document area to crop. Return them as percentages (0.0 to 1.0) of the image width and height.
2. Extract all the text clearly visible in that area.

Respond ONLY with a raw JSON object (no markdown formatting, no \`\`\`json) in this exact format:
{
  "corners": {
    "topLeft": { "x": 0.1, "y": 0.1 },
    "topRight": { "x": 0.9, "y": 0.1 },
    "bottomRight": { "x": 0.9, "y": 0.9 },
    "bottomLeft": { "x": 0.1, "y": 0.9 }
  },
  "text": "The extracted text goes here..."
}` 
    : `You are an AI document scanner. I have provided an image of a document page.
1. Find the coordinates of the 4 corners of the document page. Return them as percentages (0.0 to 1.0) of the image width and height.
2. Extract the main text of the document.

Respond ONLY with a raw JSON object (no markdown formatting, no \`\`\`json) in this exact format:
{
  "corners": {
    "topLeft": { "x": 0.1, "y": 0.1 },
    "topRight": { "x": 0.9, "y": 0.1 },
    "bottomRight": { "x": 0.9, "y": 0.9 },
    "bottomLeft": { "x": 0.1, "y": 0.9 }
  },
  "text": "The extracted text goes here..."
}`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: promptText },
          {
            inline_data: {
              mime_type: "image/jpeg",
              data: base64Data
            }
          }
        ]
      }
    ]
  };

  try {
    const configuredModel = import.meta.env.VITE_BONE_AI_MODEL;
    const candidateModels = Array.from(new Set([
      configuredModel,
      'gemini-1.5-flash',
      'gemini-1.5-flash-latest',
      'gemini-1.5-pro',
      'gemini-flash-latest',
      'gemini-pro-latest'
    ].filter(Boolean)));

    let resultText = null;
    let lastError = null;

    for (const modelName of candidateModels) {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          if (response.status === 404 || response.status === 400) {
             lastError = new Error(`Model ${modelName} returned ${response.status}`);
             continue; // Try next model
          }
          throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (resultText) {
          break; // Success!
        }
      } catch (err) {
        lastError = err;
        continue;
      }
    }

    if (!resultText) {
      throw lastError || new Error('No text returned from Gemini after trying all models.');
    }

    // Use regex to extract the first JSON object in case Gemini includes extra conversational text
    let jsonString = resultText;
    const jsonRegex = /\{[\s\S]*\}/;
    const match = resultText.match(jsonRegex);
    if (match) {
      jsonString = match[0];
    }

    // Try to parse the JSON response
    const parsed = JSON.parse(jsonString);
    return {
      corners: parsed.corners || null,
      text: parsed.text || ''
    };
  } catch (err: any) {
    console.error("Gemini Scan Error:", err);
    throw new Error(`Gemini Scan Error: ${err.message || err}`);
  }
}
