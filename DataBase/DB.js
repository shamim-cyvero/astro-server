import mongoose from "mongoose";

const dbConnection = () => {
  mongoose
    .connect(process.env.DATA_BASE_URL)
    .then((res) => {
      console.log(`Data Base Connected with ${res.connection.host}`);
    })
    .catch((err) => {
      console.log(`error ${err}`);
    });
}; 
export default dbConnection;
