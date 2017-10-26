require('dotenv').config();

const express = require('express'),
    cors = require('cors'),
    bodyParser = require('body-parser'),
    session = require('express-session'),
    passport = require('passport'),
    Auth0Strategy = require('passport-auth0'),
    massive = require('massive'),
    port = 3005; 

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());

massive(process.env.CONNECTION_STRING).then( (db) => {
    app.set('db', db);
})

passport.use(new Auth0Strategy({
    domain: process.env.AUTH_DOMAIN,
    clientID: process.env.AUTH_CLIENT_ID,
    clientSecret: process.env.AUTH_CLIENT_SECRET,
    callbackURL: process.env.AUTH_CALLBACK
  }, function(accessToken, refreshToken, extraParams, profile, done) {
    
    // check if user exists in users table
    // if they do, then invoke done with user's id
    // if not, then we will create new user
    // then invoke done with new user's id
    // done(null, profile)

    const db = app.get('db');
    const userData = profile._json;
    db.find_user([userData.identities[0].user_id]).then( user => {
        if (user[0]){
            return done(null, user[0].id);
        } else {
            db.create_user([
                userData.name,
                userData.email,
                userData.picture,
                userData.identities[0].user_id
            ]).then( user => {
                return done(null, user[0].id)
            })
        }

    })

}));

passport.serializeUser(function(id, done){
    done(null, id) 
});
passport.deserializeUser(function(id, done){
    app.get('db').find_session_user([id]).then(user => {
        done(null, user[0]); // id or profile info put on req.user
    })
});

app.get('/auth', passport.authenticate('auth0'));
app.get('/auth/callback', passport.authenticate('auth0', {
    successRedirect: 'http://localhost:3000/#/private',
    failureRedirect: '/auth'
}));
app.get('/auth/me', function(req,res){
    if(req.user){
        return res.status(200).send(req.user)
    } else {
        res.status(401).send('Unauthorized: Need to log in.')
    }
});
app.get('/logout', function(req, res){
    req.logOut();
    return res.redirect(308, 'http://localhost:3000/')
});


app.listen(port, ()=> console.log(`listening on port ${port}`));