import { Router } from 'express'
import { requestPermission, fetchPermissions, updatePermissionStatus, checkPermission } from '../controllers/permissions.controller'

const router = Router()

router.post('/', requestPermission)
router.get('/check', checkPermission)
router.get('/:userId/:role', fetchPermissions)
router.put('/:id/status', updatePermissionStatus)

export default router
