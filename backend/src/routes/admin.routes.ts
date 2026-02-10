import { Router } from 'express';
import { adminAuth, adminDb } from '../lib/firebaseAdmin';

const router = Router();

// DELETE /admin/users/:uid - Permanently delete a user from Auth and Firestore
router.delete('/users/:uid', async (req, res) => {
    const { uid } = req.params;

    if (!uid) {
        return res.status(400).json({ error: "User UID is required" });
    }

    try {
        console.log(`🗑️ Attempting to delete user: ${uid}`);

        // 1. Delete from Firebase Authentication
        await adminAuth.deleteUser(uid);

        // 2. Delete from Firestore
        await adminDb.collection("users").doc(uid).delete();

        // 3. Optional: Delete from other collections (e.g., if they have posts, etc.)
        // For now, we leave content or implement a cascade delete if requested.

        console.log(`✅ Successfully deleted user ${uid}`);
        return res.status(200).json({ message: "User deleted successfully" });
    } catch (error: any) {
        console.error("Error deleting user:", error);
        // If user not found in Auth, try deleting from Firestore anyway to clean up
        if (error.code === 'auth/user-not-found') {
            try {
                await adminDb.collection("users").doc(uid).delete();
                return res.status(200).json({ message: "User cleaned up from Firestore (Auth record was missing)" });
            } catch (fsError) {
                return res.status(500).json({ error: "Failed to delete user from Firestore" });
            }
        }
        return res.status(500).json({ error: error.message || "Failed to delete user" });
    }
});

// PUT /admin/users/:uid/role - Update User Role
router.put('/users/:uid/role', async (req, res) => {
    const { uid } = req.params;
    const { role } = req.body;

    if (!uid || !role) {
        return res.status(400).json({ error: "UID and Role are required" });
    }

    try {
        // Update Firestore
        await adminDb.collection("users").doc(uid).update({ role });

        // Optional: Set Custom Claims for improved security
        await adminAuth.setCustomUserClaims(uid, { role });

        res.json({ message: "User role updated successfully" });
    } catch (error: any) {
        console.error("Error updating role:", error);
        res.status(500).json({ error: "Failed to update user role" });
    }
});

// PUT /admin/users/:uid/verify - Update Verification Status
router.put('/users/:uid/verify', async (req, res) => {
    const { uid } = req.params;
    const { isVerified } = req.body;

    if (!uid || typeof isVerified !== 'boolean') {
        return res.status(400).json({ error: "UID and isVerified status required" });
    }

    try {
        await adminDb.collection("users").doc(uid).update({ isVerified });
        res.json({ message: `User verification set to ${isVerified}` });
    } catch (error: any) {
        console.error("Error updating verify status:", error);
        res.status(500).json({ error: "Failed to update verification status" });
    }
});

export default router;
