import { Request, Response } from 'express'
import { createMeeting, getMeetings, updateMeeting } from '../services/dynamo.service'

export const scheduleMeeting = async (req: Request, res: Response) => {
    try {
        const meeting = await createMeeting(req.body);
        res.json(meeting);
    } catch (error) {
        console.error("Error scheduling meeting", error);
        res.status(500).json({ error: 'Failed to schedule meeting' });
    }
}

export const fetchUserMeetings = async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const meetings = await getMeetings(userId);
        res.json(meetings);
    } catch (error) {
        console.error("Error fetching meetings", error);
        res.status(500).json({ error: 'Failed to fetch meetings' });
    }
}

export const updateMeetingStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await updateMeeting(id, { status });
        res.json(result);
    } catch (error) {
        console.error("Error updating meeting status", error);
        res.status(500).json({ error: 'Failed to update meeting status' });
    }
}

export const startMeeting = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { videoUrl } = req.body;

        if (!videoUrl) {
            return res.status(400).json({ error: 'Video URL is required' });
        }

        const result = await updateMeeting(id, { videoUrl, status: 'approved' }); // Ensure it's approved if started
        res.json(result);
    } catch (error) {
        console.error("Error starting meeting", error);
        res.status(500).json({ error: 'Failed to start meeting' });
    }
}
