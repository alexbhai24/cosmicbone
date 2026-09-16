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
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

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
    ],
    generationConfig: {
      temperature: 0.1,
      response_mime_type: "application/json"
    }
  };

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      throw new Error('No text returned from Gemini');
    }

    // Strip markdown formatting if Gemini wrapped it in ```json
    let cleanText = resultText.trim();
    if (cleanText.startsWith('```json')) {
      cleanText = cleanText.substring(7);
    } else if (cleanText.startsWith('```')) {
      cleanText = cleanText.substring(3);
    }
    if (cleanText.endsWith('```')) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();

    // Try to parse the JSON response
    const parsed = JSON.parse(cleanText);
    return {
      corners: parsed.corners || null,
      text: parsed.text || ''
    };
  } catch (err) {
    console.error("Gemini Scan Error:", err);
    throw err;
  }
}
