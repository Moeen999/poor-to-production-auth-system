import app from "./src/app.js";
import configs from "./src/config/config.js";
import connectDB from "./src/config/db.js";

connectDB();
app.listen(configs.PORT, () => {
  console.log(`Server is runnig at port: ${configs.PORT}`);
});
