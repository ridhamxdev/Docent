import { Request, Response } from 'express'
import { createNotification, getNotifications, markNotificationRead, markAllNotificationsRead } from '../services/dynamo.service'

export const getNotificationsHandler = async (req: Request, res: Response) => {
    try {
        const userId = req.query.userId as string
        if (!userId) {
            res.status(400).json({ error: 'Missing userId' })
            return
        }
        const notifications = await getNotifications(userId)
        res.json(notifications)
    } catch (error) {
        console.error('Get notifications error', error)
        res.status(500).json({ error: 'Failed to fetch notifications' })
    }
}

export const createNotificationHandler = async (req: Request, res: Response) => {
    try {
        const notification = await createNotification(req.body)
        res.json(notification)
    } catch (error) {
        console.error('Create notification error', error)
        res.status(500).json({ error: 'Failed to create notification' })
    }
}

export const markReadHandler = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        await markNotificationRead(id)
        res.json({ success: true, id })
    } catch (error) {
        console.error('Mark read error', error)
        res.status(500).json({ error: 'Failed to mark notification as read' })
    }
}

export const markAllReadHandler = async (req: Request, res: Response) => {
    try {
        const { userId } = req.body // Assuming passed in body for safety, or we can take from query if consistent
        if (!userId) {
            res.status(400).json({ error: 'Missing userId' })
            return
        }
        const result = await markAllNotificationsRead(userId)
        res.json(result)
    } catch (error) {
        console.error('Mark all read error', error)
        res.status(500).json({ error: 'Failed to mark all as read' })
    }
}
