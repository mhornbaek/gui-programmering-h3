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

  // Update every 1 seconds
  setInterval(updatePosition, 1000);
};

// Update GPS position
const updatePosition = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition((position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      canvasName.innerText = `${username}
            latitude: ${lat}
            longitude: ${lng}`;
    });
  } else {
    console.log("Geolocation is not supported by this browser.");
  }
};
