const authUrl =
  "http://192.168.0.188/development/bhavana/local_prod/suitecrm/index.php?entryPoint=CustomerAPI";
let authToken = "";
const urlParams = new URLSearchParams(window.location.search);
const userId = urlParams.get("id");

document.getElementById("profile").addEventListener("change", function (event) {
  const file = event.target.files[0];
  if (file) {
    document.getElementById("profileImg").src = URL.createObjectURL(file);
    document.getElementById("profileFileName").value = file.name;
  } else {
    document.getElementById("profileFileName").value = "";
  }
});

async function getToken() {
  try {
    const response = await fetch(authUrl, { method: "POST" });
    if (!response.ok) throw new Error("Failed to get token");
    const data = await response.json();
    authToken = data.token;
    if (userId) {
      fetchUser(userId);
    }
  } catch (error) {
    showError("Auth Error: " + error.message);
  }
}

async function fetchUser(id) {
  try {
    const response = await fetch(`${authUrl}&id=${id}`, {
      method: "GET",
      headers: { Authorization: authToken },
    });

    if (!response.ok) throw new Error("Failed to fetch user data");
    const user = await response.json();
    fillForm(user);
  } catch (error) {
    showError(error.message);
  }
}

function fillForm(user) {
  document.getElementById("formTitle").textContent = "Edit User";
  document.getElementById("firstName").value = user.first_name;
  document.getElementById("lastName").value = user.last_name;
  document.getElementById("dob").value = user.dob;
  document.getElementById("phone").value = user.phone;
  document.getElementById("email").value = user.email;
  document.getElementById("gender").value = user.gender;
  document.getElementById("address").value = user.address;

  if (user.profile) {
    document.getElementById("profileImg").src = user.profile;
    document.getElementById("profileFileName").value = user.profile
      .split("/")
      .pop();
  }
}

function showError(message) {
  const errorEl = document.getElementById("error-message");
  errorEl.textContent = message;
  errorEl.style.display = "block";
}

document.getElementById("userForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const requestBody = {
    first_name: document.getElementById("firstName").value,
    last_name: document.getElementById("lastName").value,
    dob: document.getElementById("dob").value,
    phone: document.getElementById("phone").value,
    email: document.getElementById("email").value,
    gender: document.getElementById("gender").value,
    address: document.getElementById("address").value,
    profile:
      document.getElementById("profile").files.length > 0
        ? document.getElementById("profile").files[0].name
        : document.getElementById("profileFileName").value,
  };

  const method = userId ? "PATCH" : "POST";
  const endpoint = userId ? `${authUrl}&id=${userId}` : authUrl;

  try {
    const response = await fetch(endpoint, {
      method: method,
      headers: {
        Authorization: authToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const responseText = await response.text();
      throw new Error("Failed to save user data. Response: " + responseText);
    }

    const responseData = await response.json();
    if (responseData.status === "success") {
      window.location.href = "index.html";
    } else {
      throw new Error(
        "Error saving user data: " + (responseData.message || "Unknown error")
      );
    }
  } catch (error) {
    console.error("Request failed: ", error);
    showError(error.message);
  }
});

window.addEventListener("DOMContentLoaded", () => {
  getToken();
});
