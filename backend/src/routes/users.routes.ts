
import { Router } from 'express'
import { getUserByName, toggleFollow } from '../services/dynamo.service'
import { adminDb } from '../lib/firebaseAdmin'

const router = Router()

/* ---------- SEARCH DENTISTS (FOR PATIENT/STUDENT DISCOVERY) ---------- */
router.get('/search/dentists', async (req, res) => {
    try {
        const excludeUid = req.query.exclude as string || '';
        const queryText = (req.query.q as string || '').toLowerCase();

        const snapshot = await adminDb.collection('users')
            .where('role', '==', 'dentist')
            .get();

        let dentists = snapshot.docs
            .map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    uid: doc.id,
                    displayName: data.displayName || data.name || 'Dentist',
                    photoURL: data.photoURL || null,
                    role: data.role,
                    specialization: data.specialization || null,
                    qualification: data.qualification || data.qualifications || null,
                    experience: data.experience || null,
                    clinicName: data.clinicName || null,
                    clinicAddress: data.clinicAddress || null,
                    consultationFee: data.consultationFee || null,
                    isVerified: data.isVerified || false,
                    bio: data.bio || null,
                };
            })
            .filter(d => d.id !== excludeUid); // Exclude self

        // Text search filter
        if (queryText) {
            dentists = dentists.filter(d =>
                (d.displayName || '').toLowerCase().includes(queryText) ||
                (d.specialization || '').toLowerCase().includes(queryText) ||
                (d.clinicName || '').toLowerCase().includes(queryText) ||
                (d.clinicAddress || '').toLowerCase().includes(queryText)
            );
        }

        res.json(dentists);
    } catch (err) {
        console.error('Search Dentists Error:', err);
        res.status(500).json({ error: 'Failed to search dentists' });
    }
})

/* ---------- GET ALL USERS (FOR SEARCH/SHARE) ---------- */
router.get('/', async (req, res) => {
    try {
        // Fetch from Firestore (Source of Truth for Auth/Profiles)
        const snapshot = await adminDb.collection('users').get();

        const users = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                name: data.displayName || data.name || 'User', // Fallback
                role: data.role,
                photoURL: data.photoURL,
                avatar: data.photoURL,
                isVerified: data.isVerified
            };
        });

        res.json(users)
    } catch (err) {
        console.error('Fetch All Users Error:', err)
        res.status(500).json({ error: 'Failed to fetch users' })
    }
})

/* ---------- GET USER PROFILE BY UID ---------- */
router.get('/profile/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const docSnap = await adminDb.collection('users').doc(uid).get();

        if (!docSnap.exists) {
            return res.status(404).json({ error: 'User not found' });
        }

        const data = docSnap.data()!;
        res.json({
            id: docSnap.id,
            uid: docSnap.id,
            displayName: data.displayName || data.name || 'User',
            photoURL: data.photoURL || null,
            coverPhoto: data.coverPhoto || null,
            role: data.role || 'patient',
            bio: data.bio || null,
            about: data.about || null,
            specialization: data.specialization || null,
            qualification: data.qualification || data.qualifications || null,
            experience: data.experience || null,
            clinicName: data.clinicName || null,
            clinicAddress: data.clinicAddress || null,
            consultationFee: data.consultationFee || null,
            collegeName: data.collegeName || null,
            yearOfStudy: data.yearOfStudy || null,
            isVerified: data.isVerified || false,
            followers: Array.isArray(data.followers) ? data.followers.length : 0,
            following: Array.isArray(data.following) ? data.following.length : 0,
        });
    } catch (err) {
        console.error('Fetch User Profile Error:', err);
        res.status(500).json({ error: 'Failed to fetch user profile' });
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
