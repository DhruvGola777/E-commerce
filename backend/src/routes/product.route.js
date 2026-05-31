import express from 'express'
import {upload} from '../config/multer.js'
import authSeller from '../middleware/auth.seller.js'
import {addProduct, changeStock, productById, productList} from '../controllers/product.controller.js'
const productRouter=express.Router()

productRouter.post('/add', upload.array("images", 4), authSeller, addProduct);
productRouter.post('/stock',authSeller,changeStock);
productRouter.get('/list',productList);
productRouter.get('/id',productById);

export default productRouter;