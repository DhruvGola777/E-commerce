import Product from '../models/product.model.js'
import Order from '../models/order.model.js'
import User from '../models/user.model.js';
import stripe from 'stripe';
export const placeOrder = async (req, res) => {
    try {
        // console.log("USER ID FROM MIDDLEWARE:", req.body.userId);
        // const userId = req.body.userId
        const { userId, items, address } = req.body;
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
        const userId = req.body.userId
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
        console.log("USER FROM AUTH MIDDLEWARE:", req.userId);
        const { userId } = req.userId;
        const orders = await Order.find({})
            .populate("items.product").populate("address").sort({ createdAt: -1 })
        console.log("ALL ORDERS:", orders);
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
        }).populate("items.product address")
        res.json({ success: true, orders })
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
export const stripeWebhooks = async (req, res) => {
    const stripeInstance = new stripe(process.env.STRIPE_SECRET_KEY);
    const sig = request.headers["stripe-signature"];
    let event;
    try {
        event = stripeInstance.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (error) {
        res.status(400).send(`Webhooks Error:${error.message}`)
    }
    switch (event.type) {
        case "payment_intent.succeeded": {
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.Id;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId
            });
            const { orderId, userId } = session.data[0].metadata;
            await Order.findByIdAndUpdate(orderId,{isPaid:true})
            await User.findByIdAndUpdate(userId,{cartItems: {}})
            break;
        }
         case "payment_intent.payment_failed":{
            const paymentIntent = event.data.object;
            const paymentIntentId = paymentIntent.Id;
            const session = await stripeInstance.checkout.sessions.list({
                payment_intent: paymentIntentId
            });
            const { orderId } = session.data[0].metadata;
            await Order.findByIdAndUpdate(orderId);
            break;
         }
        default:
            console.log(`Unhandled event type ${event.type}`)
            break;
    }
    res.json({received:true})
}