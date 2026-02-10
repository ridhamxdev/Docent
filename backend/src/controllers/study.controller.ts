import { Request, Response } from 'express'
import { createStudyMaterial, getStudyMaterials, deleteStudyMaterial } from '../services/dynamo.service'

export const getMaterials = async (req: Request, res: Response) => {
    try {
        const category = req.query.category as string | undefined
        const userId = req.query.userId as string | undefined
        const materials = await getStudyMaterials(category, userId)
        res.json(materials)
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch study materials' })
    }
}

export const createMaterial = async (req: Request, res: Response) => {
    try {
        const material = await createStudyMaterial(req.body)
        res.json(material)
    } catch (error) {
        res.status(500).json({ error: 'Failed to create study material' })
    }
}

export const deleteMaterial = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        await deleteStudyMaterial(id)
        res.json({ success: true, id })
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete study material' })
    }
}
