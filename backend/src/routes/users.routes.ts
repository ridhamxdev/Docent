
import { Router } from 'express'
import { getUserByName, getAllUsers, toggleFollow } from '../services/dynamo.service'

const router = Router()

/* ---------- GET ALL USERS (FOR SEARCH/SHARE) ---------- */
router.get('/', async (req, res) => {
    try {
        const users = await getAllUsers()
        // Map to safe user objects
        const safeUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            role: user.role,
            photoURL: user.photoURL,
            avatar: user.photoURL
        }))
        res.json(safeUsers)
    } catch (err) {
        console.error('Fetch All Users Error:', err)
        res.status(500).json({ error: 'Failed to fetch users' })
    }
})

/* ---------- GET USER PROFILE BY NAME ---------- */
router.get('/:name', async (req, res) => {
    try {
        const name = req.params.name
        const user = await getUserByName(name)

        if (!user) {
            return res.status(404).json({ error: 'User not found' })
        }

        // Return only safe public info
        const safeUser = {
            id: user.id,
            name: user.name,
            role: user.role,
            bio: user.bio,
            avatar: user.photoURL, // map photoURL to avatar if needed by frontend, or just send photoURL
            photoURL: user.photoURL,
            coverPhoto: user.coverPhoto,
            qualification: user.qualification, // if exists
            experience: user.experience,
            practice: user.practice,
            specialization: user.specialization,
            isVerified: user.isVerified,
            followers: user.followers ? user.followers.length : 0,
            following: user.following ? user.following.length : 0,
            followingIds: user.following || [],
            followersList: user.followersList || [],
            followingList: user.followingList || []
        }

        res.json(safeUser)
    } catch (err) {
        console.error('Fetch User Error:', err)
        res.status(500).json({ error: 'Failed to fetch user' })
    }
})

/* ---------- TOGGLE FOLLOW ---------- */
router.post('/:id/follow', async (req, res) => {
    try {
        const { id } = req.params
        const { currentUserId } = req.body // Expecting userId in body for now (should be from auth middleware)

        if (!currentUserId) {
            return res.status(401).json({ error: 'Unauthorized' })
        }

        const result = await toggleFollow(currentUserId, id)
        res.json(result)
    } catch (err: any) {
        console.error('Follow Error:', err)
        res.status(500).json({ error: err.message || 'Failed to toggle follow' })
    }
})

export default router
