/* eslint-disable no-undef */
$(window).on('load', function () {
  checkPath();

  $('#login-btn').on('click', function (e) {
    e.preventDefault();
    adminLogin();
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
