import { Router } from 'express'
import { scheduleMeeting, fetchUserMeetings, updateMeetingStatus, startMeeting } from '../controllers/meetings.controller'

const router = Router()

router.post('/', scheduleMeeting)
router.get('/:userId', fetchUserMeetings)
router.put('/:id/status', updateMeetingStatus)
router.post('/:id/start', startMeeting)

export default router
