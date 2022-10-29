const Sauce = require("../models/Sauce");
const fs = require("fs");

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

exports.likeSauce = function (req, res, next) {
    Sauce.findOne({
            _id: req.params.id
        })
        .then(function (sauce) {
            const like = req.body.like;
            const userId = req.body.userId;
            const usersLikedArray = sauce.usersLiked;
            const usersDislikedArray = sauce.usersDisliked;
            switchLikeSauce: {
                switch (like) {
                    case 1:
                        let counterLike = 0;
                        for (let i of usersLikedArray) {
                            if (i !== userId) {
                                counterLike++;
                            } else {
                                break;
                            };
                        };
                        if (counterLike === usersLikedArray.length) {
                            usersLikedArray.push(userId);
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
                                        message: "Sauce liked"
                                    });
                                })
                                .catch(function (error) {
                                    res.status(400).json({
                                        error
                                    });
                                });
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
                        };

                        break;
                    case -1:
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
                    case 0:
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