require('dotenv').config();
const express = require('express');
const massive = require('massive');
const session = require('express-session')

// require session
const {register, login, logout, getUser} = require('./authController');
const {SERVER_PORT, CONNECTION_STRING, SESSION_SECRET} = process.env;

const app = express();
// Top level middleware
app.use(express.json());
app.use(session({
    //# don't save if no changes are made
    resave: false,

    //# even if there's no new info, we still want to make a session
    saveUninitialized: true,

    //# basically a cookie encryption
    secret: SESSION_SECRET,

    //# how long the cookie will last (usually a week or two)
    cookie: {maxAge: 1000 * 60 * 60 * 24 * 7}
}))

massive({
    connectionString: CONNECTION_STRING,
    ssl: {
        rejectUnauthorized: false
    }
}).then( db => {
    app.set('db', db);
    console.log('Ahoy! Connected to db, matey')
}).catch( err => console.log(err));

// Enpoints

app.post("/auth/register", register)
app.post("/auth/login", login)
app.post("/auth/logout", logout)
app.get("/auth/get-user", getUser)

app.listen(SERVER_PORT, () => console.log(`Connected to port ${SERVER_PORT}⛵⚓`))
