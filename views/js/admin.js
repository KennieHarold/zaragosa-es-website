/* eslint-disable no-undef */
var targetIds = [
  'eng-1q-grade',
  'eng-2q-grade',
  'eng-3q-grade',
  'eng-4q-grade',
  'math-1q-grade',
  'math-2q-grade',
  'math-3q-grade',
  'math-4q-grade',
  'sci-1q-grade',
  'sci-2q-grade',
  'sci-3q-grade',
  'sci-4q-grade',
  'fil-1q-grade',
  'fil-2q-grade',
  'fil-3q-grade',
  'fil-4q-grade',
  'ap-1q-grade',
  'ap-2q-grade',
  'ap-3q-grade',
  'ap-4q-grade',
  'epp-1q-grade',
  'epp-2q-grade',
  'epp-3q-grade',
  'epp-4q-grade',
  'mapeh-1q-grade',
  'mapeh-2q-grade',
  'mapeh-3q-grade',
  'mapeh-4q-grade',
  'esp-1q-grade',
  'esp-2q-grade',
  'esp-3q-grade',
  'esp-4q-grade',
];

var subjectCodes = ['eng', 'math', 'sci', 'fil', 'ap', 'epp', 'mapeh', 'esp'];

var students = [];
var targetId = '';

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
    loadForms();
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

  $('.update-grade-button').on('click', function (e) {
    $('#no-form-badge').hide();
    $('#no-student-badge').hide();
    setupUpdateGradeModal(e);
  });

  $('#search-form-button').on('click', function (e) {
    e.preventDefault();
    searchForm();
  });

  $('#update-confirm-grade-btn').on('click', function (e) {
    e.preventDefault();
    updateGradeOnTable();
  });

  $('#update-form-btn').on('click', function (e) {
    e.preventDefault();
    updateForm();
  });

  $('#print-btn').on('click', function (e) {
    e.preventDefault();
    print();
  });

  $('#add-event-btn').on('click', function (e) {
    e.preventDefault();
    addEvent();
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
            View Student
            <i class='fa fa-location-arrow' style='font-size: 18px; margin-left: 0.25em'></i>
          </button>
          <button
            onClick="window.location.href = '/admin/enrolment/update/${student.id}'" 
            class='btn btn-info btn-sm'
            style='margin-right: 0.5em'
          >
            Update Student Info
            <i class='fa fa-pencil' style='font-size: 18px; margin-left: 0.25em'></i>
          </button>
          <button
            onClick="window.location.href = '/admin/forms?studentId=${student.id}&schoolYear=${student.schoolYear}'" 
            class='btn text-white btn-sm'
            style='background-color: #EEBD0C'
          >
            Update Report Card
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
}

function parseFormsFields() {
  if (!schoolYear) {
    const currentYear = new Date().getFullYear();
    $('#school-year-search-select').val((currentYear - 1).toString() + '-' + currentYear.toString());
  } else {
    $('#school-year-search-select').val(schoolYear);
  }
}

function checkUpdate() {
  if (student) {
    $('#student-id-input').val(student.studentId);
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

function searchForm() {
  if ($('#search-input').val() === '') {
    alert('Please input search keyword!');
    return;
  }

  window.location.href =
    '/admin/forms?search=' + $('#search-input').val() + '&schoolYear=' + $('#school-year-search-select').val();
}

function setupUpdateGradeModal(e) {
  targetId = e.target.dataset.targetId;

  if (student && schoolYear && targetIds.includes(targetId)) {
    $('#enter-grade-input').val('');

    const name = student?.firstname + ' ' + student?.middleInitial + ' ' + student?.lastname;
    const subject = getSubjectNameFromTargetId(targetId);
    const quarter = getQuarterFromTargetId(targetId);

    $('#update-grade-modal-name').text(name);
    $('#update-grade-modal-subject').text(subject);
    $('#update-grade-modal-quarter').text(quarter);
    $('#update-grade-modal-sy').text(schoolYear);
    $('#update-grade-modal').modal('show');
  } else {
    alert('No student found on that specific school year!');
  }
}

function getSubjectNameFromTargetId(targetId) {
  const subject = targetId.split('-')[0];

  switch (subject) {
    case 'math':
      return 'Mathematics';
    case 'sci':
      return 'Science';
    case 'eng':
      return 'English';
    case 'fil':
      return 'Filipino';
    case 'ap':
      return 'Araling Panlipunan (AP)';
    case 'epp':
      return 'Edukasyong Pangkabuhayan at Pangtahanan (EPP)';
    case 'mapeh':
      return 'Music, Arts, Physical Education, and Health (MAPEH)';
    case 'esp':
      return 'Edukasyon sa Pagpapakatao (ESP)';
    default:
      return '';
  }
}

function getQuarterFromTargetId(targetId) {
  const quarter = targetId.split('-')[1];

  switch (quarter) {
    case '1q':
      return 'First Quarter';
    case '2q':
      return 'Second Quarter';
    case '3q':
      return 'Third Quarter';
    case '4q':
      return 'Fourth Quarter';
    default:
      return '';
  }
}

function updateGradeOnTable() {
  const grade = parseInt($('#enter-grade-input').val());

  if (targetId && targetId !== '') {
    if (grade >= 50 && grade <= 100) {
      $('#' + targetId).text(grade);

      // Calculate remarks
      calculateRemarks();
      calculateGenAve();

      $('#update-grade-modal').modal('hide');
    } else {
      alert('Please input grade between 75 and 100!');
    }
  }
}

function calculateRemarks() {
  const subject = targetId.split('-')[0];

  let total = 0;

  for (i = 1; i <= 4; i++) {
    const grade = parseInt($('#' + subject + '-' + i + 'q-grade').text()) || 0;
    total += grade;
  }

  const ave = total / 4;

  $('#remarks-badge-' + subject).empty();

  if (ave >= 75) {
    $('#remarks-badge-' + subject).append('<span class="badge badge-success text-white p-2">Passed</span>');
  } else {
    $('#remarks-badge-' + subject).append('<span class="badge badge-danger text-white p-2">Failed</span>');
  }
}

function calculateAllRemarks() {
  for (let i = 0; i < subjectCodes.length; i++) {
    let total = 0;

    for (let j = 1; j <= 4; j++) {
      const grade = parseInt($('#' + subjectCodes[i] + '-' + j + 'q-grade').text()) || 0;
      total += grade;
    }

    const ave = total / 4;

    $('#remarks-badge-' + subjectCodes[i]).empty();

    if (ave >= 75) {
      $('#remarks-badge-' + subjectCodes[i]).append('<span class="badge badge-success text-white p-2">Passed</span>');
    } else {
      $('#remarks-badge-' + subjectCodes[i]).append('<span class="badge badge-danger text-white p-2">Failed</span>');
    }
  }
}

function calculateGenAve() {
  // Calculate Gen Average
  let genTotal = 0;
  for (i = 1; i <= targetIds.length; i++) {
    const grade = parseInt($('#' + targetIds[i]).text()) || 0;
    genTotal += grade;
  }

  const genAve = parseFloat(genTotal / targetIds.length).toFixed(2);

  $('#general-average').text(genAve >= 60 ? genAve : '60.00');
  $('#general-average').css('color', genAve >= 75 ? 'green' : 'red');

  $('#general-average').append(
    genAve >= 75
      ? '<span class="badge badge-success text-white p-2" style="margin-left: 2em">Passed</span>'
      : '<span class="badge badge-danger text-white p-2" style="margin-left: 2em">Failed</span>',
  );
}

async function updateForm() {
  if (student && schoolYear) {
    const base = {
      studentId: student?.id,
      schoolYear: schoolYear,
    };

    const quarter1 = {...base};
    const quarter2 = {...base};
    const quarter3 = {...base};
    const quarter4 = {...base};

    for (let i = 0; i < targetIds.length; i++) {
      const subject = targetIds[i].split('-')[0];
      const quarter = targetIds[i].split('-')[1];

      if (quarter === '1q') {
        quarter1[subject] = parseInt($('#' + targetIds[i]).text()) || 0;
        quarter1['quarter'] = '1q';
      } else if (quarter === '2q') {
        quarter2[subject] = parseInt($('#' + targetIds[i]).text()) || 0;
        quarter2['quarter'] = '2q';
      } else if (quarter === '3q') {
        quarter3[subject] = parseInt($('#' + targetIds[i]).text()) || 0;
        quarter3['quarter'] = '3q';
      } else if (quarter === '4q') {
        quarter4[subject] = parseInt($('#' + targetIds[i]).text()) || 0;
        quarter4['quarter'] = '4q';
      } else {
        // Pass
      }
    }

    try {
      await axios.post('/api/v1/admin/forms', quarter1);
      await axios.post('/api/v1/admin/forms', quarter2);
      await axios.post('/api/v1/admin/forms', quarter3);
      await axios.post('/api/v1/admin/forms', quarter4);

      alert('Successfully updated!');
    } catch (error) {
      console.log(error);
      alert('There is an error');
    }
  } else {
    alert('No student found on that specific school year!');
  }
}

function loadForms() {
  if (forms.length > 0) {
    for (let i = 0; i < forms.length; i++) {
      const quarter = forms[i].quarter;
      const form = {...forms[i]};

      delete form.id;
      delete form.schoolYear;
      delete form.studentId;
      delete form.quarter;

      Object.keys(form).forEach((subject) => {
        $('#' + subject + '-' + quarter + '-grade').text(form[subject]);
      });
    }

    calculateAllRemarks();
    calculateGenAve();
  }
}

function print() {
  var prtContent = document.getElementById('print-area');
  var WinPrint = window.open('', '', 'left=0,top=0,width=800,height=900,toolbar=0,scrollbars=0,status=0');
  WinPrint.document.write(prtContent.innerHTML);
  WinPrint.document.close();
  WinPrint.focus();
  WinPrint.print();
  WinPrint.close();
}

async function addEvent() {
  try {
    const event = $('#event-name-input').val();
    const date = $('#event-date-input').val();

    if (!event || !date || event === '' || date === '') {
      alert('Please input required fields!');
      return;
    }

    const payload = {
      event,
      date,
    };

    const res = await axios.post('/api/v1/admin/calendar', payload).catch((err) => {
      alert(err.response.data.message);
    });

    if (res.status === 200) {
      alert('Successfully added!');
      $('#event-name-input').val('');
      $('#event-date-input').val('');
    }
  } catch (error) {
    console.log(error);
    alert('Something went wrong adding the event!');
  }
}
