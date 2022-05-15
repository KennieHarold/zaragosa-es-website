/* eslint-disable no-undef */
$(window).on('load', function () {
  checkPath();

  $('#login-btn').on('click', function (e) {
    e.preventDefault();
    adminLogin();
  });

  $('#submit-student-btn').on('click', function (e) {
    e.preventDefault();
    addStudent();
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

  createCookie('token', res.data.token, 60);
  window.location.href = '/admin/dashboard';
}

function checkPath() {
  $('#tab-' + path).addClass('admin-tab-active');
}

async function addStudent() {
  const firstname = $('#firstname-input').val();
  const middleInitial = $('#middleinitial-input').val();
  const lastname = $('#lastname-input').val();
  const age = $('#age-input').val();
  const bday = new Date($('#bday-input').val()).getTime();
  const gender = $('input[name="gender"]:checked').val();

  if (!firstname || !lastname || !age || !bday) {
    alert('Please input required fields!');
    return;
  }

  if (firstname === '' || lastname === '' || age === '' || age === '0' || bday === '') {
    alert('Please input required fields!');
    return;
  }
}
