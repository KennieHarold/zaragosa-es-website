import bodyParser from 'body-parser';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fs from 'fs';

import {Request} from 'express';

import {adminLogin} from 'controllers/user';
import {rbac} from 'middlewares/auth';

const app = express();
const port = process.env.PORT || 8080;

app.set('view engine', 'ejs');
app.use('/', express.static(__dirname + '/../views/'));

app.use(cors());
app.use(express.json());
app.use(bodyParser.json({limit: '500mb'}));
app.use(
  bodyParser.urlencoded({
    parameterLimit: 100000,
    limit: '500mb',
    extended: true,
  }),
);
app.use(cookieParser());

const checkLocalHost = (req: Request) => {
  const req_protocol = 'https://';
  if (req.get('host') === `localhost:${port}`) {
    return req.protocol + '://' + req.get('host');
  } else {
    return req_protocol + req.get('host');
  }
};

//  Setup DB
if (!fs.existsSync('./db')) {
  fs.mkdirSync('./db');
}

// Public
app.get('/', (req, res) => {
  const domainName = checkLocalHost(req);
  res.render('./index', {domainName});
});

app.get('/about', (req, res) => {
  const domainName = checkLocalHost(req);
  res.render('./about', {domainName});
});

app.get('/history', (req, res) => {
  const domainName = checkLocalHost(req);
  res.render('./history', {domainName});
});

app.get('/admin', rbac('/admin/students'), (req, res) => {
  const domainName = checkLocalHost(req);
  res.render('./admin', {domainName});
});

app.get('/admin/students', rbac('/admin'), (req, res) => {
  const domainName = checkLocalHost(req);
  res.render('./students', {domainName, path: 'students'});
});

app.get('/admin/enrolment', rbac('/admin'), (req, res) => {
  const domainName = checkLocalHost(req);
  res.render('./enrolment', {domainName, path: 'enrolment'});
});

app.get('/admin/forms', rbac('/admin'), (req, res) => {
  const domainName = checkLocalHost(req);
  res.render('./forms', {domainName, path: 'forms'});
});

app.get('/admin/calendar', rbac('/admin'), (req, res) => {
  const domainName = checkLocalHost(req);
  res.render('./calendar', {domainName, path: 'calendar'});
});

// APIs
app.post('/api/v1/admin/login', adminLogin);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
