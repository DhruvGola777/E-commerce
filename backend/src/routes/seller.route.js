import express from 'express'
import { isSellerAuth, sellerLogin, sellerLogout } from '../controllers/seller.controller.js';
import  authSeller  from '../middleware/auth.seller.js';
const sellerRouter=express.Router();

sellerRouter.post('/login',sellerLogin)
sellerRouter.post('/logout',authSeller,sellerLogout)
sellerRouter.get('/is-auth',authSeller,isSellerAuth)

export default sellerRouter;