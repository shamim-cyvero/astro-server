import mongoose from "mongoose";

const astroDb = () => {
  mongoose
    .connect(process.env.DATA_BASE_URL)
    .then((res) => {
      console.log(`Data Base Connected with ${res.connection.host}`);
    })
    .catch((error) => {
      console.log(`error ${error}`);
    });
}; 
export default astroDb;
