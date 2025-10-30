// ده السيرفر السري بتاعك - المحرك
// مكانه لازم يكون: api/index.js

export default async function handler(request, response) {
    
    // 1. نتأكد إن الطلب جاي من الموقع بتاعنا (POST)
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Only POST requests are allowed' });
    }

    // 2. نجيب المفتاح السري من Vercel
    // ❗️❗️ ده أهم سطر: بيستخدم الاسم "kawnai" اللي إنت كتبته في Vercel
    const apiKey = process.env.kawnai;

    if (!apiKey) {
        console.error("Vercel Error: API key 'kawnai' is missing!");
        return response.status(500).json({ message: "API key is not configured on the server." });
    }

    // 3. ناخد الداتا (الصور والوصف) اللي جاية من الموقع
    const { parts, generationConfig } = request.body;
    
    if (!parts) {
         return response.status(400).json({ message: "Missing 'parts' in request body." });
    }
    
    // 4. نجهز الطلب اللي هيروح لجوجل
    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image-preview:generateContent?key=${apiKey}`;
    const payload = {
        contents: [{ parts: parts }],
        generationConfig: generationConfig || { responseModalities: ['IMAGE'] }
    };

    // 5. نكلم جوجل سرياً من السيرفر
    try {
        const googleResponse = await fetch(googleApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!googleResponse.ok) {
            const errorData = await googleResponse.json();
            console.error("Google API Error:", errorData);
            return response.status(googleResponse.status).json({ message: "Error from Google API", details: errorData });
        }

        const result = await googleResponse.json();
        
        // 6. نرجع النتيجة (الصورة) للموقع بتاعنا
        return response.status(200).json(result);

    } catch (error) {
        console.error("Internal Server Error:", error);
        return response.status(500).json({ message: "Internal server error.", details: error.message });
    }
}
