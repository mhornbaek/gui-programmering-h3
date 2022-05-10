// DOM Elements
const canvasForm = document.getElementById("canvasForm");
const canvasText = document.getElementById("canvasText");

const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("name");

let username = "";
let id = -1;
let myLat = -1;
let myLng = -1;

// Update username and show canvas
const confirmUsername = async () => {
  username = usernameInput.value;

  loginForm.hidden = true;
  canvasForm.hidden = false;

  // Initial Call
  updatePosition();
};

// Update GPS position
const updatePosition = () => {
  if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        myLat = lat;
        myLng = lng;

        if (id === -1) {

          // One time setup to get unique user id
          await forbind(myLat, myLng);
        }
      },
      null,
      {
        enableHighAccuracy: false,
        timeout: 5000,
        maximumAge: Infinity,
      }
    );
  } else {
    canvasText.innerText = ("Geolocation is not supported by this browser.");
  }
};

// Send updated GPS position to server
const updateInfo = async () => {

  const response = await fetch(`/api/info`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id,
      lat: myLat,
      lng: myLng,
    }),
  });

  const data = await response.json();

  if (data.error) {
    canvasText.innerText = data.error;
    return;
  }

  canvasText.innerText = `${username}
  My latitude: ${myLat}
  My longitude: ${myLng}
  
  ${JSON.stringify(data)}`;
};

const forbind = async (lat, lng) => {
  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: username,
      lat,
      lng,
    }),
  });

  const data = await response.json();

  if (data.error) {
    canvasText.innerText = data.error;
    return;
  }

  // Get my id from response
  id = data.id;

  // Initial Call
  updateInfo();

  // Continuous Call
  setInterval(updateInfo, 2000);
};
