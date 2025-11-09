const express = require('express');
const session = require('express-session');
const app = express();
const externalUrl = process.env.RENDER_EXTERNAL_URL;
const PORT = externalUrl && process.env.PORT ? parseInt(process.env.PORT) : 3000;
const pug = require('pug');
var path = require('path');
const pgSession = require('connect-pg-simple')(session);

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  store: new pgSession({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true
  }),
  secret: process.env.SESSION_SECRET || 'keyboard7cat',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: false, maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days
}));

app.use(express.static(path.join(__dirname, 'public')));

app.engine('pug', require('pug').__express);
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.set('port', process.env.PORT || 3000);

const xssRoutes = require('./routes/xss');
const nesigPodaciRoutes = require('./routes/nesigurniPodaci');

app.use('/xss', xssRoutes);
app.use('/nesigurniPodaci', nesigPodaciRoutes);

app.get('/', (req, res) => {
    res.render('mainPage');
});

if(externalUrl){
    const hostname = '0.0.0.0';
    app.listen(PORT, hostname, (error) =>{
        if(!error){
            console.log(`Server is Successfully Running at http://${hostname}:${PORT}/ and from outside on ${externalUrl}`);
        } else {
            console.log("Error occurred, server can't start", error);
            }
        }

    );
}
