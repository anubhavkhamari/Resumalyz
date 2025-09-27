async function getHrAiReview(resumeText, jdText) {
    const prompt = `
    You are an AI career assistant. Please review the candidate's resume in relation to the provided job description. 
    Give constructive feedback in a friendly, helpful tone so that the candidate understands how to improve their resume.
    
    Provide feedback as if you are directly talking to the candidate, covering:
    - What is good in the resume (strengths)
    - Areas that could be improved (weaknesses)
    - Specific suggestions to make the resume more suitable for the job
    
    Job Description:
    ${jdText}
    
    Candidate Resume:
    ${resumeText}
    
    Please write your feedback in complete sentences, easy to understand, and actionable for the candidate.
    `;

    const url = 'https://api.groq.com/openai/v1/chat/completions';
    const apiKey = process.env.GROQ_API_KEY;

    const payload = {
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Groq API error: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        const review = data.choices?.[0]?.message?.content || 'No review generated';
        return review;

    } catch (err) {
        console.error('Groq API HR review failed:', err.message);
        return 'HR review could not be generated at this time.';
    }
}

module.exports = { getHrAiReview };  