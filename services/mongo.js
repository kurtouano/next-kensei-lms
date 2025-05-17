import mongoose from "mongoose";

export async function mongoConnect() {
  try {
    const conn = await mongoose.connect(String(process.env.MONGODB));
    return conn;
  } catch (error) {
    console.log(error);
  }
}
