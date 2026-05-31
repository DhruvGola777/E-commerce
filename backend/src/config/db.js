import mongoose from "mongoose";

async function connectDB() {
   try {
   await mongoose.connect(process.env.MONGO_URI)
   console.log("Connected to DataBase✅")
   } catch (error) {
   console.error(error.message)
   }

}
export default connectDB;