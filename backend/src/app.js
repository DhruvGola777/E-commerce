import express from 'express'
import cookieParser from 'cookie-parser';
import cors from 'cors'
import userRouter from './routes/user.route.js';
import sellerRouter from './routes/seller.route.js';
import productRouter from './routes/product.route.js';
import cartRouter from './routes/cart.route.js';
import orderRouter from './routes/orders.route.js';
import addressRouter from './routes/address.route.js';
import { stripeWebhooks } from './controllers/order.controller.js';

const app = express();
// Allow multiple origins
const allowedOrigins = ['http://localhost:5173','e-commerce-chi-lilac-66.vercel.app']

app.post('/stripe',express.raw({type:'application/json'}),stripeWebhooks)

//Middleware configurations
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: allowedOrigins, credentials: true }))

app.get('/', (req,res) => res.send("API is working"))

app.use('/api/user', userRouter)
app.use('/api/seller', sellerRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/address', addressRouter)
app.use('/api/order', orderRouter)


export default app;

