import jwt from 'jsonwebtoken'

const authSeller=async(req,res,next)=>{
    const {sellerToken}=req.cookies;
    if (!sellerToken) {
        return res.json({success:false ,message:"Not authorized"})
    }
    try {
            const tokenDecoded=jwt.verify(sellerToken,process.env.JWT_SECRET)
            if(tokenDecoded.email===process.env.SELLER_EMAIL){
                next()
            }
            else{
                return res.json({
                success:false,
                message:"Not authorized"
            })
            }
        } catch (error) {
            res.json({success:false , message:error.message})
        }
}
export default authSeller