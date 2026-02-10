import { Router } from 'express'
import * as messagesController from '../controllers/messages.controller'

const router = Router()

/* ---------- MESSAGES ---------- */
// GET /messages/:userId (For getting all messages involving this user)
router.get('/:userId', messagesController.getChat)

// POST /messages
// Body: Message
router.post('/', messagesController.sendMessage)


/* ---------- APPOINTMENTS ---------- */
// GET /messages/appointments/:doctorId
router.get('/appointments/:doctorId', messagesController.fetchAppointments)

// POST /messages/appointments
// Body: Appointment
router.post('/appointments', messagesController.requestAppointment)

export default router
