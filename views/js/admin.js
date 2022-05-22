/* eslint-disable no-undef */
var students = [];

$(window).on('load', async function () {
  checkPath();

  if (path === 'students') {
    getStudents();
  }

  if (path === 'enrolment') {
    parseEnrolmentFields();
    checkUpdate();
  }

  if (path === 'forms') {
    parseFormsFields();
  }

  $('#login-btn').on('click', function (e) {
    e.preventDefault();
    adminLogin();
  });

  $('#submit-student-btn').on('click', function (e) {
    e.preventDefault();
    addStudent();
  });

  $('#update-student-btn').on('click', function (e) {
    e.preventDefault();
    updateStudent();
  });

  $('#logout-btn').on('click', function () {
    logout();
  });

  $('.update-grade-button').on('click', function () {
    $('#update-grade-modal').modal('show');
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

  students = res?.data || [];

  students.forEach((student, index) => {
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
          <button 
            onClick="setupViewModal('${student.id}')" 
            class='btn btn-primary btn-sm' 
            style='margin-right: 0.5em'
          >
            View
            <i class='fa fa-location-arrow' style='font-size: 18px; margin-left: 0.25em'></i>
          </button>
          <button
            onClick="window.location.href = '/admin/enrolment/update/${student.id}'" 
            class='btn btn-info btn-sm'>
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function setupViewModal(studentId) {
  const selectedStudent = students.find((student) => student.id === studentId);

  $('#modal-student-name').text(
    selectedStudent.firstname + ' ' + selectedStudent.middleInitial + ' ' + selectedStudent.lastname,
  );
  $('#modal-student-grade-section').text('Grade ' + selectedStudent.grade + ' - ' + selectedStudent.section);
  $('#modal-student-bday').text(selectedStudent.bday);
  $('#modal-student-age').text(selectedStudent.age);
  $('#modal-student-gender').text(selectedStudent.gender);
  $('#modal-student-sy').text(selectedStudent.schoolYear);

  $('#modal-requirements-container').empty();

  selectedStudent.requirements.forEach((requirement) => {
    console.log(requirement);
    $('#modal-requirements-container').append(`
      <span style='margin-right: 5px; margin-bottom: 5px'>${getRequirementComponent(requirement)}</span>
    `);
  });

  $('#view-student-modal').modal('show');
}

function getRequirementComponent(requirement) {
  switch (requirement) {
    case 'enrolmentForm':
      return 'Enrolment Form<i class="fa fa-check" style="margin-left: 5px; color: green"></i>';

    case 'baptismalCertificate':
      return 'Baptismal Certificate<i class="fa fa-check" style="margin-left: 5px; color: green"></i>';

    case 'birthCertificate':
      return 'Birth Certificate<i class="fa fa-check" style="margin-left: 5px; color: green"></i>';

    case 'personalDataSheet':
      return 'Personal Data Sheet<i class="fa fa-check" style="margin-left: 5px; color: green"></i>';

    case 'gradeCard':
      return 'Grade Card<i class="fa fa-check" style="margin-left: 5px; color: green"></i>';

    default:
      return '';
  }
}

function parseEnrolmentFields() {
  const currentYear = new Date().getFullYear();
  $('#school-year-select').val((currentYear - 1).toString() + '-' + currentYear.toString());
  $('#school-year-search-select').val((currentYear - 1).toString() + '-' + currentYear.toString());
}

function parseFormsFields() {
  const currentYear = new Date().getFullYear();
  $('#school-year-search-select').val((currentYear - 1).toString() + '-' + currentYear.toString());
}

function checkUpdate() {
  if (student) {
    $('#student-id-input').val(student.id);
    $('#firstname-input').val(student.firstname);
    $('#middleinitial-input').val(student.middleInitial);
    $('#lastname-input').val(student.lastname);
    $('#age-input').val(student.age);
    $('#bday-input').val(student.bday);
    $('#' + student?.gender + '-check').prop('checked', true);
    $('#grade-input').val(student.grade);
    $('#section-input').val(student.section);
    $('#school-year-select').val(student.schoolYear);
    $('#student-id-input').attr('disabled', true);

    for (let i = 0; i < student.requirements.length; i++) {
      $('input[name="requirements"][value="' + student.requirements[i] + '"]').prop('checked', true);
    }

    $('#submit-student-btn').hide();
    $('#update-student-btn').show();
  }
}

async function updateStudent() {
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

  $('#update-student-btn').attr('disabled', true);
  $('#cancel-btn').attr('disabled', true);

  const res = await axios.put('/api/v1/admin/students/' + studentId, payload).catch((err) => {
    alert(err.response.data.message);
  });

  $('#update-student-btn').attr('disabled', false);
  $('#cancel-btn').attr('disabled', false);

  if (res.status === 200) {
    alert('Successfully updated student!');
  }
}
