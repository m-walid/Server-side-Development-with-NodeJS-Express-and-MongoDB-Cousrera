const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../authenticate");
const cors = require("./cors");
const Favorites = require("../models/favorite");
const { use } = require("passport");

const favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .then(
        (favorites) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorites);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorites) => {
          if (favorites) {
            req.body.forEach((dish) => {
              if (favorites.dishes.indexOf(dish) === -1) {
                favorites.dishes.push(dish);
              }
            });
            favorites.save().then(
              (favorites) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
              },
              (err) => next(err)
            );
          } else {
            Favorites.create({
              user: req.user._id,
              dishes: req.body,
            }).then(
              (favorites) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
              },
              (err) => next(err)
            );
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({ user: req.user._id })
      .then(
        (resp) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(resp);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => res.sendStatus(200))
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("GET operation not supported on /favorites/" + req.params.dishId);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorites) => {
          if (favorites) {
            if (favorites.dishes.indexOf(req.params.dishId) === -1) {
              favorites.dishes.push(req.params.dishId);
              favorites.save().then(
                (favorites) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorites);
                },
                (err) => next(err)
              );
            }
          } else {
            Favorites.create({
              user: req.user._id,
              dishes: [req.params.dishId],
            }).then(
              (favorites) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
              },
              (err) => next(err)
            );
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites" + req.params.dishId);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorites) => {
          if (favorites && favorites.dishes.indexOf(req.params.dishId) !== -1) {
            favorites.dishes.splice(
              favorites.dishes.indexOf(req.params.dishId),
              1
            );
            favorites.save().then(
              (favorites) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
              },
              (err) => next(err)
            );
          } else if (!favorites) {
            const err = new Error("Favorites not found!");
            err.status = 404;
            return next(err);
          } else {
            const err = new Error(
              "Dish " + req.params.dishId + " not found in favorites"
            );
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
