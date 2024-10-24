const express = require('express');
const passport = require("passport");
const session = require("express-session");
const { default: mongoose } = require("mongoose");
const GithubStrategy = require("passport-github2").Strategy;

const homeRouter = express.Router();
passport.use(
    new GithubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: "http://localhost:3000/auth/github/callback",
      },
      (accessToken, refreshToken, profile, done) => {
        return done(null, profile);
      }
    )
  );
  
  passport.serializeUser((user, done) => {
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    done(null, user);
  });
  
  homeRouter.get("/", (req, res) => {
    res.send('<a href="/auth/github">Login with Github</a>');
  });
  
  homeRouter.get(
    "/auth/github",
    passport.authenticate("github", { scope: ["user:email"] })
  );
  
  homeRouter.get(
    "/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/" }),
    (req, res) => {
      res.redirect("/profile");
    }
  );
  
  homeRouter.get("/profile", (req, res) => {
    res.send(`Hello ${req.user.username}`);
  });
  
  homeRouter.get("/logout", (req, res) => {
    req.logout(() => {
      res.redirect("/");
    });
  });

module.exports=homeRouter;