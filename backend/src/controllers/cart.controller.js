import User from "../models/user.model.js";

export const updateCart = async (req, res) => {
    try {
        const userId = req.userId
        const { cartItems } = req.body;
        await User.findByIdAndUpdate(userId, { cartItems })
        res.json({ success: true, message: "Cart updated" })
    } catch (error) {
        console.log(error.message)
        res.json({ success: false, message: error.message })
    }
}