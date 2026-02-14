
import { Router } from 'express'
import {
    createVisitSlot,
    getVisitSlots,
    createAppointment,
    getSlotById,
    updateSlot,
    getAppointments
} from '../services/dynamo.service'

const router = Router()

/* ---------- CREATE SLOT (dentist) ---------- */
router.post('/slots', async (req, res) => {
    try {
        const { dentistId, date, time, fee, capacity } = req.body
        const slot = await createVisitSlot({
            dentistId,
            date,
            time,
            fee: Number(fee),
            capacity: Number(capacity)
        })
        res.json(slot)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to create slot' })
    }
})

/* ---------- GET SLOTS (dentist/Patient) ---------- */
router.get('/slots/:dentistId', async (req, res) => {
    try {
        const slots = await getVisitSlots(req.params.dentistId)
        res.json(slots)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch slots' })
    }
})

/* ---------- BOOK APPOINTMENT (Patient) ---------- */
router.post('/book', async (req, res) => {
    try {
        const { slotId, patientId, patientName, dentistId } = req.body

        // 1. Check Slot Availability
        const slot = await getSlotById(slotId)
        if (!slot) return res.status(404).json({ error: 'Slot not found' })

        if (slot.status === 'full' || slot.bookedCount >= slot.capacity) {
            return res.status(400).json({ error: 'Slot is fully booked' })
        }

        // 2. Create Appointment
        const appointment = await createAppointment({
            patientId,
            patientName,
            dentistId,
            date: `${slot.date} ${slot.time}`, // Store formatted date for easy display
            status: 'approved' // Auto-approve for now since paid
        })

        // 3. Update Slot Count
        slot.bookedCount += 1
        if (slot.bookedCount >= slot.capacity) {
            slot.status = 'full'
        }
        await updateSlot(slot)

        res.json(appointment)
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: 'Failed to book appointment' })
    }
})

/* ---------- YOUR APPOINTMENTS (dentist View) ---------- */
// Reusing getAppointments from dynamo service which allows filtering by dentistId
router.get('/dentist/:dentistId', async (req, res) => {
    try {
        const appointments = await getAppointments(req.params.dentistId)
        res.json(appointments)
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch appointments' })
    }
})

export default router
