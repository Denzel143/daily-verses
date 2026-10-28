// api/api.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { verse, reference } = req.body;
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API_KEY tidak ditemukan di server' });
    }

    try {
        // Menggunakan model Gemini Flash yang cepat dan ringan. 
        // Google merekomendasikan 'gemini-1.5-flash' atau 'gemini-1.5-flash-8b' untuk kebutuhan lite/cepat.
        const model = "gemini-1.5-flash"; 
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // Request body khusus format Gemini
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
            throw new Error(`Gemini merespon dengan status ${response.status}`);
        }

        const data = await response.json();
        
        // PARSER GEMINI: Mengambil teks dari struktur JSON Gemini
        const meaning = data.candidates[0].content.parts[0].text.trim();
        
        // Mengirimkan teks bersih ke frontend
        res.status(200).json({ meaning });

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: 'Gagal mengambil makna dari AI Gemini' });
    }
}
