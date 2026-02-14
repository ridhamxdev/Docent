import { Request, Response } from 'express'
import { createMessage, getMessages, createAppointment, getAppointments } from '../services/dynamo.service'

export const getChat = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const messages = await getMessages(userId);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
}

export const sendMessage = async (req: Request, res: Response) => {
    try {
        const message = await createMessage(req.body);
        res.json(message);
    } catch (error) {
        res.status(500).json({ error: 'Failed to send messages' });
    }
}

export const requestAppointment = async (req: Request, res: Response) => {
    try {
        const appointment = await createAppointment(req.body);
        res.json(appointment);
    } catch (error) {
        res.status(500).json({ error: 'Failed to request appointment' });
    }
}

export const fetchAppointments = async (req: Request, res: Response) => {
    try {
        const { dentistId } = req.params;
        const appointments = await getAppointments(dentistId);
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch appointments' });
    }
}
