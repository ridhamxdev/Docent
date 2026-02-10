import { Router } from 'express'
import multer from 'multer'
import { s3Client } from '../aws'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { v4 as uuid } from 'uuid'
import { createStory, getStories, deletePost } from '../services/dynamo.service'

const router = Router()
const upload = multer({ storage: multer.memoryStorage() })
const BUCKET_NAME = process.env.AWS_BUCKET_NAME!

/* ---------- GET STORIES ---------- */
router.get('/', async (_req, res) => {
    try {
        const stories = await getStories()
        res.json(stories)
    } catch (err) {
        console.error('Fetch Stories Error:', err)
        res.status(500).json({ error: 'Failed to fetch stories' })
    }
})

/* ---------- CREATE STORY ---------- */
router.post('/', upload.single('file'), async (req, res) => {
    try {
        const { author, label } = req.body
        const file = req.file

        let image = ''
        let video = ''

        if (file) {
            const key = `stories/${uuid()}-${file.originalname}`
            await s3Client.send(
                new PutObjectCommand({
                    Bucket: BUCKET_NAME,
                    Key: key,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                })
            )
            const url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`

            if (file.mimetype.startsWith('video')) {
                video = url
            } else {
                image = url
            }
        } else if (req.body.image) {
            image = req.body.image
        }

        const story = await createStory({
            author: author || 'User',
            label: label || 'Story',
            image,
            video,
        })

        res.json(story)
    } catch (err) {
        console.error('Create Story Error:', err)
        res.status(500).json({ error: 'Failed to create story' })
    }
})

/* ---------- DELETE STORY ---------- */
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params
        // Reuse deletePost as it deletes by ID from DynamoDB
        await deletePost(id)
        res.json({ success: true, id })
    } catch (err) {
        console.error('Delete Story Error:', err)
        res.status(500).json({ error: 'Failed to delete story' })
    }
})

export default router
