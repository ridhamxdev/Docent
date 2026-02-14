import { Router, Request, Response } from 'express'
import { v4 as uuid } from 'uuid'
import { createQuiz, getQuizzes } from '../services/dynamo.service'

const router = Router()

/* ---------- SHOP: PRICE COMPARISON (MOCK) ---------- */
// GET /shop/comparison?q=Composite
router.get('/comparison', (req: Request, res: Response) => {
    const query = (req.query.q as string || '').toLowerCase()

    // Mock Data Store
    const MOCK_PRODUCTS = [
        { name: 'Composite Kit 3M', price: 2500, store: 'DentalKart', url: '#' },
        { name: 'Composite Kit 3M', price: 2350, store: 'CityDental', url: '#', bestDeal: true },
        { name: 'Composite Kit 3M', price: 2600, store: 'Amazon', url: '#' },
        { name: 'Endomotor X-Smart', price: 22000, store: 'DentalKart', url: '#' },
        { name: 'Endomotor X-Smart', price: 21500, store: 'CityDental', url: '#', bestDeal: true },
        { name: 'GIC Cement GC', price: 1200, store: 'DentalKart', url: '#' },
        { name: 'GIC Cement GC', price: 1150, store: 'Amazon', url: '#', bestDeal: true },
    ]

    if (!query) return res.json([])

    const results = MOCK_PRODUCTS.filter(p => p.name.toLowerCase().includes(query))
    res.json(results)
})

/* ---------- QUIZ (DAILY) ---------- */
// GET /shop/quiz?date=2024-02-01
router.get('/quiz', async (req: Request, res: Response) => {
    const date = req.query.date as string
    const quizzes = await getQuizzes(date)
    res.json(quizzes.length > 0 ? quizzes[0] : null)
})

// POST /shop/quiz (dentist Only)
router.post('/quiz', async (req: Request, res: Response) => {
    try {
        const quiz = await createQuiz(req.body)
        res.json(quiz)
    } catch (error) {
        res.status(500).json({ error: 'Failed to create quiz' })
    }
})

export default router
