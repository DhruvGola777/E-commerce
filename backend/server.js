import app from './src/app.js'
import connectDB from './src/config/db.js'
import connectCloudinary from './src/config/cloudinary.js'
import 'dotenv/config'
connectDB();
connectCloudinary();
const port = process.env.PORT || 4000;

app.listen(port,()=>{
    console.log(`Server is running on http://localhost:${port}`);
})