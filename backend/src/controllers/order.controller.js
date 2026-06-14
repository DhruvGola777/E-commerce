import Product from '../models/product.model.js'
import Order from '../models/order.model.js'
import User from '../models/user.model.js';
import stripe from 'stripe';
export const placeOrder = async (req, res) => {
    try {
        const userId = req.userId;
        const { items, address } = req.body;
        if (!address || items.length === 0) {
            return res.json({ success: false, message: "invalid data" })
        }
        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            amount += product.offerPrice * item.quantity;
        }
        amount += Math.floor(amount * 0.02);
        await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "COD"
        })
        res.json({ success: true, message: "order Placed Successsfully" })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
export const placeOrderStripe = async (req, res) => {
    try {
        const userId = req.userId;
        const { origin } = req.headers;
        const { items, address } = req.body;
        if (!address || items.length === 0) {
            return res.json({ success: false, message: "invalid data" })
        }
        let productData = [];
        let amount = 0;
        for (const item of items) {
            const product = await Product.findById(item.product);
            amount += product.offerPrice * item.quantity;
            productData.push({
                name: product.name,
                price: product.offerPrice,
                quantity: item.quantity
            })
        }
        amount += Math.floor(amount * 0.02);
        const order = await Order.create({
            userId,
            items,
            amount,
            address,
            paymentType: "Online"
        });
        const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
        const line_items = productData.map((item) => {
            return {
                price_data: {
                    currency: "aud",
                    product_data: {
                        name: item.name,
                    },
                    unit_amount: Math.floor(item.price + item.price * 0.02) * 100
                },
                quantity: item.quantity,
            }
        })
        const session = await stripeInstance.checkout.sessions.create({
            line_items,
            mode: "payment",
            success_url: `${origin}/loader?next=my-order`,
            cancel_url: `${origin}/cart`,
            metadata: {
                orderId: order._id.toString(),
                userId
            }
        })
        res.json({ success: true, url: session.url })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
export const getUserOrders = async (req, res) => {
    try {
        const userId = req.userId;
        const orders = await Order.find({ userId })
            .populate("items.product").populate("address").sort({ createdAt: -1 })
        res.json({ success: true, orders })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find({
            $or: [
                { paymentType: "COD" },
                { isPaid: true }
            ]
        }).populate("items.product address").sort({ createdAt: -1 })
        res.json({ success: true, orders })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
export const stripeWebhooks = async (req, res) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = req.headers["stripe-signature"];
    
    let event;
    try {
        // Stripe expects the raw body for signature verification
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        console.error("WEBHOOK SIGNATURE VERIFICATION FAILED:", error.message);
        return res.status(400).send(`Webhook Error: ${error.message}`);
    }

    console.log("STRIPE EVENT RECEIVED:", event.type);

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;
        const { orderId, userId } = session.metadata;

        try {
            console.log(`UPDATING DATABASE FOR ORDER: ${orderId}, USER: ${userId}`);
            
            // 1. Mark Order as Paid
            const orderUpdate = await Order.findByIdAndUpdate(orderId, { isPaid: true });
            
            // 2. Clear User Cart
            const userUpdate = await User.findByIdAndUpdate(userId, { cartItems: {} });

            if (orderUpdate && userUpdate) {
                console.log("DATABASE UPDATED SUCCESSFULLY");
            } else {
                console.error("DATABASE UPDATE FAILED: Order or User not found", { orderId, userId });
            }
        } catch (dbError) {
            console.error("DATABASE ERROR DURING WEBHOOK:", dbError.message);
        }
    }

    res.json({ received: true });
}