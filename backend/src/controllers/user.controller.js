import jwt from 'jsonwebtoken';
import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'

export const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.json({
                success: false,
                message: "Missing details"
            })
        }
        const isUserAlreadyExists = await User.findOne({ email })

        if (isUserAlreadyExists) {
            return res.json({
                success: false,
                message: "User already exists"
            })
        }
        const HashedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({ name, email, password: HashedPassword })
        const token = jwt.sign({
            id: user._id
        },
            process.env.JWT_SECRET,
            { expiresIn: '7d' })
            
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? 'none' : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                cartItems: user.cartItems
            }
        })
    } catch (error) {
        console.log(error.message)
        res.json({
            success: false, message: error.message
        })
    }
}
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.json({
                success: false,
                message: "Email and password are required"
            })
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.json({
                success: false,
                message: "Email and password are Invalid"
            })
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.json({
                success: false,
                message: "Email and password are Invalid"
            })
        }
        const token = jwt.sign({
            id: user._id
        },
            process.env.JWT_SECRET,
            { expiresIn: '7d' })
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? 'none' : "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000
        })
        return res.json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                cartItems: user.cartItems
            }
        })

    } catch (error) {
        console.log(error.message)
        res.json({
            success: false, message: error.message
        })
    }
}
export const isAuth = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId).select("-password")
        return res.json({ success: true, user })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}
export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : "strict"
        })
        return res.json({ success: true, message: "User Logged Out" })
    } catch (error) {
        return res.json({ success: false, message: error.message })
    }
}