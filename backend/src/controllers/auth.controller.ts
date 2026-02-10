
import { Request, Response } from 'express'
import { createUser, getUserByEmail } from '../services/dynamo.service'

export const register = async (req: Request, res: Response) => {
    try {
        const {
            email, password, name, role,
            // Dentist
            documentUrl,
            // Student
            college, year,
            // Patient
            age, sex, state, district
        } = req.body

        const existingUser = await getUserByEmail(email)
        if (existingUser) {
            res.status(400).json({ error: 'User already exists' })
            return
        }

        // In a real app, hash the password here (e.g., bcrypt)
        const passwordHash = password;

        const newUser = await createUser({
            email,
            passwordHash,
            name,
            role,
            documentUrl,
            isVerified: role === 'dentist' ? false : true, // Dentists need manual verification
            college,
            year,
            age,
            sex,
            state,
            district,
            profileImage: `https://ui-avatars.com/api/?name=${name}&background=random`
        })

        // Exclude password from response
        const { passwordHash: _, ...userWithoutPassword } = newUser as any
        res.status(201).json(userWithoutPassword)
    } catch (error) {
        console.error('Registration Error', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body

        const user = await getUserByEmail(email)
        if (!user || user.passwordHash !== password) {
            res.status(401).json({ error: 'Invalid credentials' })
            return
        }

        // Exclude password from response
        const { passwordHash: _, ...userWithoutPassword } = user
        res.json(userWithoutPassword)
    } catch (error) {
        console.error('Login Error', error)
        res.status(500).json({ error: 'Internal Server Error' })
    }
}
