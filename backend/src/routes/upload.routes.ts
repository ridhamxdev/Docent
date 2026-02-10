import { Router, Request, Response } from 'express';
import multer from 'multer';
import * as s3Service from '../services/s3.service';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/', upload.single('file'), async (req: Request, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const folder = req.body.folder || 'misc';
        const fileUrl = await s3Service.uploadFile(req.file.buffer, req.file.mimetype, folder);
        res.json({ url: fileUrl });
    } catch (error) {
        res.status(500).json({ error: 'Upload failed' });
    }
});

export default router;
