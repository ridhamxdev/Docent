import { Router } from 'express'
import * as studyController from '../controllers/study.controller'

const router = Router()

/* ---------- GET MATERIALS ---------- */
// GET /study?category=books
router.get('/', studyController.getMaterials)

/* ---------- CREATE MATERIAL ---------- */
// POST /study
// Body: StudyMaterial
router.post('/', studyController.createMaterial)

// DELETE /study/:id
router.delete('/:id', studyController.deleteMaterial)

/* ---------- QUIZ ROUTES ---------- */
import * as quizController from '../controllers/quiz.controller'

// GET /study/quiz
router.get('/quiz', quizController.getDailyQuizzes)

// POST /study/quiz
router.post('/quiz', quizController.createDailyQuiz)

export default router
