import { Router } from 'express'
import { createMessage, getMessages, createAppointment, getAppointments } from '../services/dynamo.service'
import { notifyUser } from '../socket'

const router = Router()

/* ---------- APPOINTMENTS ---------- */
// GET /messages/appointments/:dentistId
router.get('/appointments/:dentistId', async (req, res) => {
    try {
        const { dentistId } = req.params
        const appointments = await getAppointments(dentistId)
        res.json(appointments)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch appointments' })
    }
})

// POST /messages/appointments
// Body: Appointment
router.post('/appointments', async (req, res) => {
    try {
        const appointment = await createAppointment(req.body)
        res.json(appointment)
    } catch (err) {
        res.status(500).json({ error: 'Failed to request appointment' })
    }
})

/* ---------- GET MESSAGES ---------- */
router.get('/:userId', async (req, res) => {
    try {
        const { userId } = req.params
        // Fix: Use userId to fetch correct messages
        // Check if getMessages logic filters by sender/receiver
        const messages = await getMessages(userId)
        res.json(messages)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch messages' })
    }
})

/* ---------- SEND MESSAGE ---------- */
router.post('/', async (req, res) => {
    try {
        const { senderId, receiverId, content, attachmentUrl, attachmentType, senderName } = req.body

        const message = await createMessage({
            senderId,
            receiverId,
            senderName,
            content,
            attachmentUrl,
            attachmentType,
            read: false
        })

        // Emit Real-Time Event
        notifyUser(receiverId, 'newMessage', message);
        // Optionally notify sender too for multi-device sync
        // notifyUser(senderId, 'newMessage', message);

        res.json(message)
    } catch (err) {
        console.error('Send Error:', err)
        res.status(500).json({ error: 'Failed to send message' })
    }
})

export default router
