// api/api.js

module.exports = async (req, res) => {
    // Hanya menerima method POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { verse, reference } = req.body;
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API_KEY tidak ditemukan di environment variables' });
    }

    try {
        const model = "gemini-1.5-flash"; 
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [
                        { text: "Kamu adalah pembimbing rohani yang bijaksana. Berikan renungan atau makna singkat, padat, dan menguatkan (maksimal 3-4 kalimat) dari ayat Alkitab yang diberikan. Gunakan bahasa Indonesia yang hangat, bersahabat, dan mudah dipahami." }
                    ]
                },
                contents: [
                    {
                        parts: [
                            { text: `Tolong jelaskan makna dari ayat ini: "${verse}" - ${reference}` }
                        ]
                    }
                ],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 250
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error("Gemini API Error:", errorData);
            throw new Error(`Gemini API Error: ${response.status}`);
        }

        const data = await response.json();
        const meaning = data.candidates[0].content.parts[0].text.trim();
        
        res.status(200).json({ meaning });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: 'Gagal mengambil makna dari AI Gemini' });
    }
};
