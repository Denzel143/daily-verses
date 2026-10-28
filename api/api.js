// api/api.js

export default async function handler(req, res) {
    // Hanya menerima method POST
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    // Mengambil verse dan reference dari body request frontend
    const { verse, reference } = req.body;
    
    // Mengambil API Key dari Environment Variables
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'API_KEY tidak ditemukan di server' });
    }

    try {
        // Melakukan request ke Groq API dari sisi Server
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [
                    {
                        role: "system",
                        content: "Kamu adalah pembimbing rohani yang bijaksana. Berikan renungan atau makna singkat, padat, dan menguatkan (maksimal 3-4 kalimat) dari ayat Alkitab yang diberikan. Gunakan bahasa Indonesia yang hangat, bersahabat, dan mudah dipahami."
                    },
                    {
                        role: "user",
                        content: `Tolong jelaskan makna dari ayat ini: "${verse}" - ${reference}`
                    }
                ],
                temperature: 0.7,
                max_tokens: 250
            })
        });

        if (!response.ok) {
            throw new Error(`Groq API merespon dengan status ${response.status}`);
        }

        const data = await response.json();
        
        // Mengirim balik hasil dari Groq ke Frontend
        res.status(200).json(data);

    } catch (error) {
        console.error("API Error:", error);
        res.status(500).json({ error: 'Gagal mengambil makna dari AI' });
    }
}
