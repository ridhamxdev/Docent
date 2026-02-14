import { Request, Response } from 'express'
import { createPermissionRequest, getPermissionRequests, updatePermissionRequest, checkUploadPermission } from '../services/dynamo.service'

export const requestPermission = async (req: Request, res: Response) => {
    try {
        const request = await createPermissionRequest(req.body);
        res.json(request);
    } catch (error) {
        console.error("Error requesting permission", error);
        res.status(500).json({ error: 'Failed to request permission' });
    }
}

export const fetchPermissions = async (req: Request, res: Response) => {
    try {
        const { userId, role } = req.params;
        if (role !== 'patient' && role !== 'dentist') {
            return res.status(400).json({ error: 'Invalid role' });
        }
        const requests = await getPermissionRequests(userId, role);
        res.json(requests);
    } catch (error) {
        console.error("Error fetching permissions", error);
        res.status(500).json({ error: 'Failed to fetch permissions' });
    }
}

export const updatePermissionStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['approved', 'rejected', 'used'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await updatePermissionRequest(id, status);
        res.json(result);
    } catch (error) {
        console.error("Error updating permission", error);
        res.status(500).json({ error: 'Failed to update permission' });
    }
}

export const checkPermission = async (req: Request, res: Response) => {
    try {
        const { patientId, dentistId } = req.query;
        if (!patientId || !dentistId) {
            return res.status(400).json({ error: 'Missing parameters' });
        }

        const permission = await checkUploadPermission(patientId as string, dentistId as string);
        res.json({ hasPermission: !!permission, permission });
    } catch (error) {
        console.error("Error checking permission", error);
        res.status(500).json({ error: 'Failed to check permission' });
    }
}
