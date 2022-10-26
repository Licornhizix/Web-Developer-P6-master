const Sauce = require("../models/Sauce");
const fs = require("fs");

//Renvoie de l'ensemble des sauces 
exports.getAllSauce = function (req, res, next) {
    Sauce.find()
        .then(function (sauces) {
            res.status(200).json(sauces);
        })
        .catch(function (error) {
            res.status(400).json({
                error: error
            });
        })
};
//Ajout d'une sauce
exports.createSauce = function (req, res, next) {
    const sauceObject = JSON.parse(req.body.sauce);
    delete sauceObject._id;
    const sauce = new Sauce({
        ...sauceObject,
        likes: 0,
        dislikes: 0,
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    });
    sauce.save()
        .then(function () {
            res.status(201).json({
                message: "Post saved successfully"
            });
        })
        .catch(function (error) {
            res.status(400).json({
                error: error
            });
        });
};
//Renvoie d'une sauce
exports.getOneSauce = function (req, res, next) {
    Sauce.findOne({
            _id: req.params.id
        })
        .then(function (sauce) {
            res.status(200).json(sauce);
        })
        .catch(function (error) {
            res.status(404).json({
                error: error
            });
        });
};
//Mise à jour d'une sauce
exports.modifySauce = function (req, res, next) {
    const sauceObject = req.file ? {
        ...JSON.parse(req.body.sauce),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${req.file.filename}`
    } : {
        ...req.body
    };
    if (req.file) {
        Sauce.findOne({
                _id: req.params.id
            })
            .then(function (sauce) {
                const filename = sauce.imageUrl.split("/images/")[1];
                fs.unlink(`images/${filename}`, function (error) {
                    if (error) {
                        console.log(error)
                    } else {
                        console.log("Old file delete")
                    };
                });
            })
            .catch(function (error) {
                res.status(500).json({
                    error
                });
            });
    };
    Sauce.updateOne({
            _id: req.params.id
        }, {
            ...sauceObject,
            _id: req.params.id
        })
        .then(function () {
            res.status(200).json({
                message: "Sauce updated successfully"
            });
        })
        .catch(function (error) {
            res.status(400).json({
                error
            });
        });
};
//Suppression d'une sauce
exports.deleteSauce = function (req, res, next) {
    Sauce.findOne({
            _id: req.params.id
        })
        .then(function (sauce) {
            if (!sauce) {
                res.status(404).json({
                    error: new Error("No such sauce")
                });
            } else {
                if (sauce.userId !== req.auth.userId) {
                    res.status(400).json({
                        error: new Error("Unauthorized request")
                    });
                } else {
                    Sauce.findOne({
                            _id: req.params.id
                        })
                        .then(function (sauce) {
                            const filename = sauce.imageUrl.split("/images/")[1];
                            fs.unlink(`images/${filename}`, function () {
                                Sauce.deleteOne({
                                        _id: req.params.id
                                    })
                                    .then(function () {
                                        res.status(200).json({
                                            message: "Deleted"
                                        });
                                    })
                                    .catch(function (error) {
                                        res.status(400).json({
                                            error: error
                                        });
                                    });
                            });
                        })
                        .catch(function (error) {
                            res.status(500).json({
                                error
                            });
                        });
                }
            }
        })
};
//Likes et dislikes
exports.likeSauce = function (req, res, next) {
    Sauce.findOne({ //retourne la sauce selectionnée
            _id: req.params.id
        })
        .then(function (sauce) {
            const like = req.body.like;
            const userId = req.body.userId;
            const usersLikedArray = sauce.usersLiked;
            const usersDislikedArray = sauce.usersDisliked;
            switchLikeSauce: {
                switch (like) {
                    case 1: //Action d'ajouter un like ou un  dislike
                        let counterLike = 0; //Compteur du like de départ définit à 0
                        for (let i of usersLikedArray) { //Recherche dans le tableau des utilisateurs :
                            if (i !== userId) { //Si l'utilisateur n'a pas déjà liké la sauce
                                counterLike++; //L'incrément de 1 est possible
                            } else { //Sinon
                                break; //boucle
                            };
                        };

                        if (counterLike === usersLikedArray.length) { //L'utilisateur à liké la sauce
                            usersLikedArray.push(userId);
                            Sauce.updateOne({ //appel à la fonction de mise à jour d'une sauce (mise à jour de l'objet en base de donnée)
                                    _id: req.params.id
                                }, {
                                    $set: {
                                        usersLiked: usersLikedArray,
                                        likes: usersLikedArray.length
                                    }
                                })
                                .then(function () {
                                    res.status(200).json({
                                        message: "Sauce liked"
                                    });
                                })
                                .catch(function (error) {
                                    res.status(400).json({
                                        error
                                    });
                                });

                            for (let i in usersDislikedArray) { //On recherche si l'utilisateur n'avait pas disliké la sauce
                                if (usersDislikedArray[i] === userId) { //Si dislike éxistant
                                    usersDislikedArray.splice(i, 1); //On le retire du tableau
                                    Sauce.updateOne({ //appel à la fonction de mise à jour d'une sauce (mise à jour de l'objet en base de donnée)
                                            _id: req.params.id
                                        }, {
                                            $set: {
                                                usersDisliked: usersDislikedArray,
                                                dislikes: usersDislikedArray.length
                                            }
                                        })
                                        .then(function () {
                                            res.status(200).json({
                                                message: "Dislike user delete"
                                            });
                                        })
                                        .catch(function (error) {
                                            res.status(400).json({
                                                error
                                            });
                                        });
                                    break;
                                };
                            };
                        };

                        break;
                    case -1: //Ajouter un dislike
                        let counterDislike = 0;
                        for (let i of usersDislikedArray) {
                            if (i !== userId) {
                                counterDislike++;
                            } else {
                                break;
                            };
                        };

                        if (counterDislike === usersDislikedArray.length) {
                            usersDislikedArray.push(userId);
                            Sauce.updateOne({
                                    _id: req.params.id
                                }, {
                                    $set: {
                                        usersDisliked: usersDislikedArray,
                                        dislikes: usersDislikedArray.length
                                    }
                                })
                                .then(function () {
                                    res.status(200).json({
                                        message: "Sauce disliked"
                                    });
                                })
                                .catch(function (error) {
                                    res.status(400).json({
                                        error
                                    });
                                });
                            for (let i in usersLikedArray) {
                                if (usersLikedArray[i] === userId) {
                                    usersLikedArray.splice(i, 1);
                                    Sauce.updateOne({
                                            _id: req.params.id
                                        }, {
                                            $set: {
                                                usersLiked: usersLikedArray,
                                                likes: usersLikedArray.length
                                            }
                                        })
                                        .then(function () {
                                            res.status(200).json({
                                                message: "Like user delete"
                                            });
                                        })
                                        .catch(function (error) {
                                            res.status(400).json({
                                                error
                                            });
                                        });
                                    break;
                                };
                            };
                        };

                        break;
                    case 0: //Supprimez un like ou un dislike
                        for (let i in usersLikedArray) {
                            if (usersLikedArray[i] === userId) {
                                usersLikedArray.splice(i, 1);
                                Sauce.updateOne({
                                        _id: req.params.id
                                    }, {
                                        $set: {
                                            usersLiked: usersLikedArray,
                                            likes: usersLikedArray.length
                                        }
                                    })
                                    .then(function () {
                                        res.status(200).json({
                                            message: "Like user delete"
                                        });
                                    })
                                    .catch(function (error) {
                                        res.status(400).json({
                                            error
                                        });
                                    });
                                break switchLikeSauce;
                            };
                        };
                        for (let i in usersDislikedArray) {
                            if (usersDislikedArray[i] === userId) {
                                usersDislikedArray.splice(i, 1);
                                Sauce.updateOne({
                                        _id: req.params.id
                                    }, {
                                        $set: {
                                            usersDisliked: usersDislikedArray,
                                            dislikes: usersDislikedArray.length
                                        }
                                    })
                                    .then(function () {
                                        res.status(200).json({
                                            message: "Dislike user delete"
                                        });
                                    })
                                    .catch(function (error) {
                                        res.status(400).json({
                                            error
                                        });
                                    });
                                break;
                            };
                        };

                        break;
                    default:
                        res.status(500).json({
                            error: "Valeur variable like requête inconnue"
                        });
                };
            };

        })
        .catch(function (error) {
            res.status(500).json({
                error
            });
        });
};