
import cookieParser from 'cookie-parser';
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';

const app = express();
const port = 8000;

app.use(express.json());
app.use(cookieParser());

const corsOptions = {
    origin: 'http://localhost:3000',
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
    credentials: true,
    preflightContinue: true
}
  

const users = [
    {
        login: 'test',
        password: '12345',
    },
];

const cookieOptions = {
    maxAge: 1000 * 60 * 15, //15 min
    httpOnly: true,
}

app.options('/users', cors(corsOptions))
app.get('/users', cors(corsOptions), async (req, res) => {
    try {
        if (req.cookies.authCookie === undefined || !users.find(u => u.token === req.cookies.authCookie)) {
            res.status(403).json({data: {message: "No cookie"}});
            return;
        }
        res.json(users.map(u => u.login));
    } catch (e) {
        res.json(e);
    }
});

app.options('/auth', cors(corsOptions))
app.post('/auth', cors(corsOptions), async (req, res) => {
    const {login, password} = req.body;
    const foundUser = users.find(u => u.login === login);
    if (!foundUser) { 
        res.status(404).json({data: {message: "No such user found"}});
        return;
    };
    if (foundUser.password !== password) {
        res.status(403).json({data: {message: "Wrong password"}});
        return;
    }
    const token = uuidv4();
    foundUser.token = token;
    res.cookie('authCookie', token, cookieOptions);
    res.json(req.body)
});

app.options('/reg', cors(corsOptions))
app.post('/reg', cors(corsOptions), async (req, res) => {
    const {login, password} = req.body;
    const foundUser = users.find(u => u.login === login);
    if (foundUser)  {
        res.status(409).json({data: {message: "User already exists"}})
        return;
    };
    const token = uuidv4();
    users.push({...req.body, password: password, token: token});
    res.cookie('authCookie', token, cookieOptions);
    res.json(req.body);
});

app.options('/checkAuth', cors(corsOptions))
app.get('/checkAuth', cors(corsOptions), async(req, res) => {
    try {
        if (req.cookies.authCookie === undefined || !users.find(u => u.token === req.cookies.authCookie)) {
            res.status(403).json({data: {message: "No cookie"}});
            return;
        }
        res.json({message: 'ok'});
    } catch (e) {
        res.json(e);
    }
})

app.options('/logout', cors(corsOptions))
app.post('/logout', cors(corsOptions), async(req, res) => {
    res.clearCookie("authCookie");
    res.end();
})

app.listen(port, () => {
    console.log('api running at http://localhost:' + port);
})