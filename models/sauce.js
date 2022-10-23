const mongoose = require("mongoose");


//Création d'un schéma de donnée 
const sauceSchema = mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    manufacturer: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    mainPepper: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    heat: {
        type: Number,
        required: true
    },
    likes: {
        type: Number
    },
    dislikes: {
        type: Number
    },
    usersLiked: {
        type: ["String"]
    },
    usersDisliked: {
        type: ["String"]
    }
});

//Export du schéma de données

module.exports = mongoose.model("Sauce", sauceSchema);