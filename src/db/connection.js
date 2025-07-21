import mongoose from  "mongoose"
import {DB_NAME} from "../constants.js"

export const connectToDB=async ()=> {

  try {

const connectionInstance=await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
console.log("Connection established with ",connectionInstance.connection.host)

  }
 catch (error) {
  console.log("MongoDB Connection failed ",error)
  process.exit(1)
 }

}