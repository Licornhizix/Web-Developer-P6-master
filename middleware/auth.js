const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decodedToken = jwt.verify(token, "RANDOM_TOKEN_SECRET");
        const userId = decodedToken.userId;
        req.auth = {
            userId
        };
        if (req.body.userId && req.body.userId !== userId) {
            throw "Invalid user ID";
        } else {
            next();
        }
    } catch {
        res.status(403).json({
            error: new Error("403: unauthorized request.")
        });
    }
};