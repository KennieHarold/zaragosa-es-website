import bodyParser from 'body-parser';
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import fs from 'fs';

import {Request} from 'express';

import {
  addStudent,
  adminLogin,
  getStudentById,
  getStudents,
  updateStudent,
  searchStudent,
  getFormsByStudentIdAndSY,
  addForm,
} from 'controllers';
import {rbac} from 'middlewares/auth';
import axios from 'axios';

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

// Admin
app.get('/admin', rbac('/admin/students'), (req, res) => {
  const domainName = checkLocalHost(req);
  res.render('./admin', {domainName, path: ''});
});

// Admin - Students
app.get('/admin/students', rbac('/admin'), (req, res) => {
  const domainName = checkLocalHost(req);
  res.render('./students', {domainName, path: 'students'});
});

// Admin - Enrolment
app.get('/admin/enrolment', rbac('/admin'), (req, res) => {
  const domainName = checkLocalHost(req);
  res.render('./enrolment', {domainName, student: null, path: 'enrolment'});
});

app.get('/admin/enrolment/update/:studentId', rbac('/admin'), async (req, res) => {
  const domainName = checkLocalHost(req);
  try {
    const student = await axios.get(`${domainName}/api/v1/admin/students/${req.params.studentId}`);
    res.render('./enrolment', {domainName, student: student.data, path: 'enrolment'});
  } catch (error) {
    console.log(error);
    res.render('./enrolment', {domainName, student: null, path: 'enrolment'});
  }
});

// Admin - Forms
app.get('/admin/forms', rbac('/admin'), async (req, res) => {
  const domainName = checkLocalHost(req);
  const search = req?.query?.search;
  const schoolYear = req?.query?.schoolYear;

  if (search && schoolYear) {
    const searchStudentRes = await axios.get(`${domainName}/api/v1/admin/search/students?search=${search}`);
    const students = searchStudentRes?.data || [];

    if (searchStudentRes.status === 200 && students.length > 0) {
      // const formSearchRes = await axios.get(
      //   `${domainName}/api/v1/admin/forms?studentId=${students[0].id}&sy=${schoolYear}`,
      // );
      return res.render('./forms', {domainName, path: 'forms', student: students[0], forms: []});
    }
  }

  return res.render('./forms', {domainName, path: 'forms', student: null, forms: []});
});

// Admin - Calendar

app.get('/admin/calendar', rbac('/admin'), (req, res) => {
  const domainName = checkLocalHost(req);
  res.render('./calendar', {domainName, path: 'calendar'});
});

// Student API
app.post('/api/v1/admin/login', adminLogin);
app.post('/api/v1/admin/students', addStudent);
app.get('/api/v1/admin/students', getStudents);
app.get('/api/v1/admin/students/:studentId', getStudentById);
app.put('/api/v1/admin/students/:studentId', updateStudent);

// Search API
app.get('/api/v1/admin/search/students', searchStudent);

// Form API
app.get('/api/v1/admin/forms', getFormsByStudentIdAndSY);
app.post('/api/v1/admin/forms', addForm);

app.listen(port, () => {
  return console.log(`Express is listening at http://localhost:${port}`);
});
