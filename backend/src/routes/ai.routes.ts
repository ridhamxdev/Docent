import { Router, Request, Response } from 'express';
import OpenAI from 'openai';

const router = Router();

// Initialize OpenAI client
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || '',
});

// POST /ai/analyze-xray - Analyze dental X-ray using OpenAI Vision
router.post('/analyze-xray', async (req: Request, res: Response) => {
    try {
        const { image, prompt } = req.body;

        if (!image) {
            return res.status(400).json({ error: 'X-ray image is required' });
        }

        // Check if user is authorized (dentist or student)
        const userRole = (req as any).user?.role;
        if (userRole !== 'dentist' && userRole !== 'student') {
            return res.status(403).json({ error: 'Access denied. This feature is only available for dentists and dental students.' });
        }

        // Make request to OpenAI Vision API
        const response = await openai.chat.completions.create({
            model: 'gpt-4o', // GPT-4 with vision capabilities
            messages: [
                {
                    role: 'system',
                    content: 'You are an expert dental radiologist AI assistant. Analyze dental X-rays and provide detailed, professional diagnostic insights. Include observations about tooth structure, potential cavities, bone health, alignment issues, and any other relevant findings. Always remind users that this is an AI analysis and should be verified by a licensed professional.'
                },
                {
                    role: 'user',
                    content: [
                        {
                            type: 'text',
                            text: prompt || 'Analyze this dental X-ray and provide comprehensive diagnostic insights.'
                        },
                        {
                            type: 'image_url',
                            image_url: {
                                url: image,
                                detail: 'high'
                            }
                        }
                    ]
                }
            ],
            max_tokens: 1000,
            temperature: 0.3, // Lower temperature for more focused, consistent medical analysis
        });

        const analysis = response.choices[0]?.message?.content;

        if (!analysis) {
            return res.status(500).json({ error: 'Failed to generate analysis' });
        }

        return res.json({
            analysis,
            timestamp: new Date().toISOString(),
            model: 'gpt-4o'
        });

    } catch (error: any) {
        console.error('Error analyzing X-ray:', error);

        if (error.code === 'insufficient_quota') {
            return res.status(402).json({
                error: 'OpenAI API quota exceeded. Please check your billing settings.'
            });
        }

        if (error.code === 'invalid_api_key') {
            return res.status(500).json({
                error: 'OpenAI API configuration error. Please contact support.'
            });
        }

        return res.status(500).json({
            error: error.message || 'Failed to analyze X-ray. Please try again.'
        });
    }
});

export default router;
