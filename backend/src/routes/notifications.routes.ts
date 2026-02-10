import { Router } from 'express'
import { getNotificationsHandler, createNotificationHandler, markReadHandler, markAllReadHandler } from '../controllers/notifications.controller'

const router = Router()

router.get('/', getNotificationsHandler)
router.post('/', createNotificationHandler)
router.put('/:id/read', markReadHandler)
router.put('/read-all', markAllReadHandler)

export default router
