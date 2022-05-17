/* eslint-disable no-undef */
$(window).on('load', async function () {
  checkPath();

  await getStudents();

  $('#login-btn').on('click', function (e) {
    e.preventDefault();
    adminLogin();
  });

  $('#submit-student-btn').on('click', function (e) {
    e.preventDefault();
    addStudent();
  });

  $('#logout-btn').on('click', function () {
    logout();
  });
});

function createCookie(name, value, days) {
  let expires;

  if (days) {
    let date = new Date();

    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);

    expires = '; expires=' + date.toGMTString();
  } else {
    expires = '';
  }

  document.cookie =
    encodeURIComponent(name) + '=' + encodeURIComponent(value) + expires + '; path=/;SameSite = Strict;';
}

async function adminLogin() {
  const username = $('#username-input').val();
  const password = $('#password-input').val();

  const data = {
    username,
    password,
  };

  const res = await axios.post('/api/v1/admin/login', data).catch((err) => {
    alert(err.response.data.message);
  });

  if (res.status === 200) {
    createCookie('token', res.data.token, 60);
    window.location.href = '/admin/students';
  }
}

function checkPath() {
  $('#tab-' + path).addClass('admin-tab-active');
}

async function addStudent() {
  const studentId = $('#student-id-input').val();
  const firstname = $('#firstname-input').val();
  const middleInitial = $('#middleinitial-input').val();
  const lastname = $('#lastname-input').val();
  const age = $('#age-input').val();
  const bday = $('#bday-input').val();
  const gender = $('input[name="gender"]:checked').val();
  const requirements = $('input[name="requirements"]:checked');
  const schoolYear = $('#school-year-select').val();
  const grade = $('#grade-input').val();
  const section = $('#section-input').val();

  if (!studentId || !firstname || !lastname || !age || !bday || !schoolYear || !grade) {
    alert('Please input required fields!');
    return;
  }

  if (
    studentId === '' ||
    firstname === '' ||
    lastname === '' ||
    age === '' ||
    age === '0' ||
    bday === '' ||
    schoolYear === '' ||
    grade === '' ||
    grade === '0'
  ) {
    alert('Please input required fields!');
    return;
  }

  const _requirements = [];
  for (let i = 0; i < requirements.length; i++) {
    _requirements.push($(requirements[i]).val());
  }

  const payload = {
    studentId,
    firstname,
    middleInitial,
    lastname,
    age,
    bday,
    gender,
    requirements: _requirements,
    schoolYear,
    grade,
    section,
  };

  $('#submit-student-btn').attr('disabled', true);
  $('#cancel-btn').attr('disabled', true);

  const res = await axios.post('/api/v1/admin/students', payload).catch((err) => {
    alert(err.response.data.message);
  });

  $('#submit-student-btn').attr('disabled', false);
  $('#cancel-btn').attr('disabled', false);
  resetForm();

  if (res.status === 200) {
    alert('Successfully added student!');
  }
}

function resetForm() {
  $('#student-id-input').val('');
  $('#firstname-input').val('');
  $('#middleinitial-input').val('');
  $('#lastname-input').val('');
  $('#age-input').val('');
  $('#bday-input').val('');
  $('#grade-input').val('');
  $('#section-input').val('');
  $('#male-check').prop('checked', true);

  const currentYear = new Date().getFullYear();
  $('#school-year-select').val((currentYear - 1).toString() + '-' + currentYear.toString());

  const requirements = $('input[name="requirements"]:checked');
  for (let i = 0; i < requirements.length; i++) {
    $(requirements[i]).prop('checked', false);
  }
}

async function getStudents() {
  const res = await axios.get('/api/v1/admin/students').catch((err) => {
    alert(err.response.data.message);
  });

  const table = $('#students-table');

  res?.data.forEach((student, index) => {
    table.append(`
    <tr>
      <td>${index + 1}</td>
      <td>${student?.firstname + ' ' + student?.middleInitial + ' ' + student?.lastname}</td>
      <td>${'Grade ' + student?.grade + ' - ' + student?.section}</td>
      <td>${student?.bday}</td>
      <td>${student?.age}</td>
      <td>${student?.gender}</td>
      <td>
        <div class='d-flex flex-row'>
          <button class='btn btn-primary btn-sm' style='margin-right: 0.5em'>
            View
            <i class='fa fa-location-arrow' style='font-size: 18px; margin-left: 0.25em'></i>
          </button>
          <button class='btn btn-info btn-sm'>
            Update
            <i class='fa fa-pencil' style='font-size: 18px; margin-left: 0.25em'></i>
          </button>
        </div>
      </td>
    </tr>
    `);
  });
}

function logout() {
  if (get_cookie('token')) {
    document.cookie = 'token' + '=' + ';path=/' + ';domain=' + ';expires=Thu, 01 Jan 1970 00:00:01 GMT';
  }

  window.location.reload();
}

function get_cookie(name) {
  return document.cookie.split(';').some((c) => {
    return c.trim().startsWith(name + '=');
  });
}
