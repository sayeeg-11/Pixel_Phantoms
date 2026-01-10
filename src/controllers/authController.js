import bcrypt from 'bcrypt';
import User from '../models/User.js';

export const registerUser = async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // 1. Basic Validation
        if (!username || !email || !password) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // 2. Check if username or email is already taken
        const userExists = await User.findOne({ 
            where: { 
                [Symbol.for('or')]: [{ username }, { email }] 
            } 
        });

        if (userExists) {
            return res.status(400).json({ error: "Username or Email already exists" });
        }

        // 3. Hash password with 10 salt rounds
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // 4. Create User in database
        const newUser = await User.create({
            username,
            email,
            password: hashedPassword
        });

        // 5. Return success (excluding password)
        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser.id,
                username: newUser.username,
                email: newUser.email
            }
        });

    } catch (error) {
        console.error("Registration Error:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};