const jwt = require("jsonwebtoken");


module.exports = function (req, res, next) {
    try {
        const token = req.headers.authorization.split(" ")[1]; //recupération du token
        const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN_SECRET); 
        //const decodedToken = jwt.verify(token, token());
        const userId = decodedToken.userId; //recupération du userid
        req.auth = {
            userId //recupération de la valeur de l'userid pour la transmettre aux routes pour vérification
        };
        if (req.body.userId && req.body.userId !== userId) {
            throw "Invalid user ID";
        } else {
            next();
        }
    } catch {
        res.status(403).json({
            error: new Error("403: unauthorized request.") // en cas de problème d'authentification
        });
    }
};

/*let rand = function() {
    return Math.random().toString(36).substr(2); // remove `0.`
};

let token = function() {
    return rand() + rand(); // to make it longer
};

token(); // "bnh5yzdirjinqaorq0ox1tf383nb3xr
*/