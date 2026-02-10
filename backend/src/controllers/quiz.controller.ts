import { Request, Response } from 'express'
import { createQuiz, getQuizzes } from '../services/dynamo.service'

export const getDailyQuizzes = async (req: Request, res: Response) => {
    try {
        const date = req.query.date as string | undefined
        const quizzes = await getQuizzes(date)
        res.json(quizzes)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch quizzes' })
    }
}

export const createDailyQuiz = async (req: Request, res: Response) => {
    try {
        const { question, options, correctAnswer, explanation, author } = req.body

        if (!question || !options || options.length < 2 || correctAnswer === undefined) {
            res.status(400).json({ error: 'Invalid quiz data' })
            return
        }

        const quiz = await createQuiz({
            question,
            options,
            correctAnswer,
            explanation,
            author, // e.g. "Dr. Smith"
            date: new Date().toISOString().split('T')[0]
        })
        res.json(quiz)
    } catch (error) {
        res.status(500).json({ error: 'Failed to create quiz' })
    }
}
