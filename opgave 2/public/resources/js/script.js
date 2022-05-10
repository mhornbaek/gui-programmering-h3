// DOM Elements
const canvasForm = document.getElementById("canvasForm");
const canvasName = document.getElementById("canvasName");

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("name");

let username = "";

// Update username and show canvas
const confirmUsername = () => {
  username = usernameInput.value;

  canvasName.innerText = username;

  loginForm.hidden = true;
  canvasForm.hidden = false;

  // Initial Call
  updatePosition();
};

// Update GPS position
const updatePosition = () => {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      canvasName.innerText = `${username}
            latitude: ${lat}
            longitude: ${lng}`;

      console.log("Updated");
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
};
