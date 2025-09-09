// Updated to call backend API instead of direct Gemini API
export default async function gemini(prompt = "Explain how AI works in a few words") {
  try {
    const response = await fetch('http://localhost:3000/gemini', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ prompt }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    console.log(data.response);
    return data.response;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    throw error;
  }
}

