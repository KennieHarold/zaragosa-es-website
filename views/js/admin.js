/* eslint-disable no-undef */
$(window).on('load', function () {
  $('#login-btn').on('click', function (e) {
    e.preventDefault();
    adminLogin();
  });
});

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

  console.log(res);
}
