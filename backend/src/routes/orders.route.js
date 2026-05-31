import express from 'express'
import authUser from '../middleware/auth.user.js'
import authSeller from '../middleware/auth.seller.js'
import { getAllOrders, getUserOrders, placeOrder, placeOrderStripe } from '../controllers/order.controller.js'
const orderRouter=express.Router()

orderRouter.post('/cod',authUser,placeOrder)
orderRouter.post('/stripe',authUser,placeOrderStripe)
orderRouter.get('/user',authUser,getUserOrders)
orderRouter.get('/seller',authSeller,getAllOrders)

export default orderRouter;