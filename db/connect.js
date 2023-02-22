const mongoose = require("mongoose");

mongoose.connect(process.env.DBURL).then((con) => {
  // console.log(con.connections);
  console.log("connected to database successfully");
});
