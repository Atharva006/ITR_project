const loginForm = document.getElementById('login-form');
    const errorMessage = document.getElementById('error-message');

    loginForm.addEventListener('submit', function (event) {
      // Prevent the form from submitting the traditional way
      event.preventDefault();

      let username = document.getElementById("username").value;
      let password = document.getElementById("password").value;

      // Hide error message on new attempt
      errorMessage.classList.remove('show');

      if ((username === "atharva" && password === "admin") || (username === "shravani" && password === "shravani")) {
        // Optional: Show a success state on the button
        const loginButton = this.querySelector('.btn');
        loginButton.textContent = 'Success!';
        loginButton.classList.add('loading'); // Show a spinner for effect

        setTimeout(() => {
          window.location.href = "../public/dashboard.html"; // Redirect to dashboard
        }, 1000); // Redirect after 1 second
      } else {
        // Show error message
        errorMessage.classList.add('show');
      }
    });