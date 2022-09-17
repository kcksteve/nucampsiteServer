const express = require('express');
const authenticate = require('../authenticate');
const cors = require('./cors');
const Favorite = require('../models/favorite');

const favoriteRouter = express.Router();

favoriteRouter.route('/')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.get(cors.cors, authenticate.verifyUser, async (req, res, next) => {
    try {
        const fav = await Favorite.findById({ user: req.user._id})
        .populate('user')
        .populate('campsite');

        if (fav) {
            res.status(200).setHeader('Content-Type', 'application/json').json(fav);
        }
    }
    catch(err) {
        next(err);
    }
})
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if (favorite) {
            req.body.forEach(favoriteCampsite => {
                if (!favorite.campsites.includes(favoriteCampsite._id)) {
                    favorite.campsites.push(favoriteCampsite._id);
                }
            });
            favorite.save()
            .then(favorite => {
                res.status(200).setHeader('Content-Type').json(favorite);
            })
            .catch((err) => next(err));
        } else {
            Favorite.create({user: req.user._id})
            .then(favorite => {
                req.body.forEach(favoriteCampsite => {
                    if (!favorite.campsites.includes(favoriteCampsite._id)) {
                        favorite.campsites.push(favoriteCampsite._id);
                    }
                });
                favorite.save()
                .then(favorite => {
                    res.status(200).setHeader('Content-Type').json(favorite);
                })
                .catch((err) => next(err));
            })
            .catch((err) => next(err));
        }
    })
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOneAndDelete({user: req.user._id})
    .then(favorite => {
        if (favorite) {
            res.status(200).setHeader('Content-Type', 'aaplication/json').json(favorite);
        } else {
            res.setHeader('Content-Type', 'text/plain').end('There is nothing to delete');
        }
    })
    .catch((err) => next(err));
})

favoriteRouter.route('/:campsiteId')
.options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
.post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if (favorite) {
            if (!favorite.campsites.include(req.params.campsiteId)) {
                favorite.campsites.push(req.params.campsiteId);
                favorite.save()
                .then(favorite => {
                    res.status(200).setHeader('Content-Type', 'aplication/json').json(favorite);
                })
                .catch((err) => next(err));
            } else {
                res.status(200).setHeader('Content-Type', 'text/plain').end('Already exists');
            }
        } else {
            Favorite.create({user: req.user._id, campsites: [req.params.campsiteId]})
            .then(favorite => {
                res.status(200).setHeader('Content-Type', 'aplication/json').json(favorite);
            })
            .catch((err) => next(err))
        }
    })
    .catch((err) => next(err));
})
.delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorite.findOne({user: req.user._id})
    .then(favorite => {
        if (favorite) {
            const index = favorite.campsite.indexOf(req.params.campsiteId);

            if (index > -1) {
                favorite.campsites.splice(index, 1);
            }

            favorite.save()
            .then(favorite => {
                res.status(200).setHeader('Content-Type', 'aplication/json').json(favorite);
            })
            .catch((err) => next(err));
        } else {
            res.status(200).setHeader('Content-Type', 'text/plain').end('No favorites to delete');
        }
    })
    .catch((err) => next(err));
})

module.exports = favoriteRouter;