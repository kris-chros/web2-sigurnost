const express = require('express');
const session = require('express-session');
const app = express();
const PORT = 3000;
const pug = require('pug');
var path = require('path');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: '$2b$10$NH13wREDvbnuRLEOfQC25.8LKfbhaM9ZnweUV0lTiFy7E9KkPPIWW',
  resave: false,
  saveUninitialized: true
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


app.listen(PORT, (error) =>{
    if(!error){
        console.log("Server is Successfully Running, and App is listening on port "+ PORT);
    } else {
        console.log("Error occurred, server can't start", error);
        }
    }
);