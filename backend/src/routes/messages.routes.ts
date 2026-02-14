import { Router } from 'express'
import { createMessage, getMessages, createAppointment, getAppointments, updateMessage } from '../services/dynamo.service'
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
        const { senderId, receiverId, content, attachmentUrl, attachmentType, senderName, metadata } = req.body

        const message = await createMessage({
            senderId,
            receiverId,
            senderName,
            content,
            attachmentUrl,
            attachmentType,
            metadata, // Pass metadata for permission requests, meeting requests, etc.
            read: false
        })

        console.log('📨 New message created:', {
            id: message.id,
            from: senderId,
            to: receiverId,
            hasMetadata: !!metadata,
            metadataType: metadata?.type
        });

        // Emit Real-Time Event to receiver
        notifyUser(receiverId, 'newMessage', message);
        console.log('🔔 Emitted to receiver:', receiverId);

        // Also emit to sender for multi-device sync
        notifyUser(senderId, 'newMessage', message);
        console.log('🔔 Emitted to sender:', senderId);

        res.json(message)
    } catch (err) {
        console.error('Send Error:', err)
        res.status(500).json({ error: 'Failed to send message' })
    }
})

/* ---------- MARK MESSAGES AS READ ---------- */
router.put('/mark-read/:conversationPartnerId', async (req, res) => {
    try {
        const { conversationPartnerId } = req.params;
        const { userId } = req.body; // Current user who is marking as read

        if (!userId) {
            return res.status(400).json({ error: 'userId is required' });
        }

        // Get all messages between the two users
        const messages = await getMessages(userId);

        // Filter messages from the conversation partner that are unread
        const unreadMessages = messages.filter(
            (msg: any) => msg.senderId === conversationPartnerId && !msg.read
        );

        console.log(`📖 Marking ${unreadMessages.length} messages as read`);

        // Actually update each message in the database
        for (const msg of unreadMessages) {
            await updateMessage(msg.id, { read: true });
        }

        // Emit socket event to notify conversation partner
        notifyUser(conversationPartnerId, 'messagesRead', {
            userId,
            count: unreadMessages.length
        });

        res.json({ success: true, count: unreadMessages.length });
    } catch (err) {
        console.error('Mark as read error:', err);
        res.status(500).json({ error: 'Failed to mark messages as read' });
    }
});

export default router
