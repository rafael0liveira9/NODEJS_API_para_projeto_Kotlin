const { urlencoded, json } = require("body-parser"),
    express = require("express"),
    serverless = require("serverless-http"),
    { config } = require("dotenv"),
    cors = require("cors"),
    router = express();
config();

router.use(cors());
router.use(json({ limit: "500mb" }));
router.use(urlencoded({ extended: true }));
router.use('/', require("./routes"));
module.exports.handler = serverless(router);
router.listen(process.env.PORT || 3030, () => console.log(`Server listening on ${process.env.PORT || 3030}`))