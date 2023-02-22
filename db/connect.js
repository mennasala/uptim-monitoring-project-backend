const mongoose = require("mongoose");

mongoose
  .connect(
    process.env.DBURL /*{
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
  }*/
  )
  .then((con) => {
    // console.log(con.connections);
    console.log("connected to database successfully");
  });
