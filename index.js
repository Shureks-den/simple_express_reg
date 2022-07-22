console.log('hello')
import express from 'express';
const app = express();
const port = 8000;
app.use(express.json());

const users = [
    {
        login: 'test',
        password: '12345',
    },
];

app.get('/users', async (req, res) => {
    try {
        res.json(users.map(u => u.login));
    } catch (e) {
        res.json(e);
    }
});

app.post('/auth', async (req, res) => {
    const {login, password} = req.body;
    const foundUser = users.find(u => u.login === login);
    if (!foundUser) { 
        res.json({status: 404, statusText: "Not Found", data: {message: "No such user found"}});
        return;
    };
    if (foundUser.password !== password) {
        res.status(403).json({data: {message: "Wrong password"}});
        return;
    }
    res.json(foundUser)
});

app.post('/reg', async (req, res) => {
    const {login} = req.body;
    const foundUser = users.find(u => u.login === login);
    if (foundUser)  {
        res.status(409).json({data: {message: "User already exists"}})
        return;
    };
    users.push(req.body);
    res.json(req.body);
});

app.listen(port, () => {
    console.log('api running at http://localhost:' + port);
})