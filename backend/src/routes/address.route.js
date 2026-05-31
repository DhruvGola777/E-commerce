import express from 'express'
import { addAddress, getAddress } from '../controllers/address.controller.js'
import authUser from '../middleware/auth.user.js'
const addressRouter=express.Router()

addressRouter.post('/add',authUser,addAddress)
addressRouter.get('/get',authUser,getAddress)

export default addressRouter;