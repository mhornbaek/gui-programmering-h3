// DOM Elements
const canvasForm = document.getElementById("canvasForm");
const canvasTest = document.getElementById("canvasTest");
const canvasText = document.getElementById("canvasText");
const canvas = document.getElementById("canvas");

// Canvas Slider
const label = document.getElementById("rangeLabel");
const slider = document.getElementById("rangeSlider");

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
  canvasTest.hidden = false;

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
    canvasText.innerText = "Geolocation is not supported by this browser.";
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
    location.reload();
    return;
  }

  updateCanvas(data);
};

// Connect to backend and get unique Id
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

// Update slider text
const updateRange = async (e) => {
  label.innerText = `Afstand: ${slider.value} km`;
};

const updateCanvas = async (data) => {
  const gpsSize = 10;
  const canvasWidth = 500;
  const canvasHeight = 500;

  const drawPerson = async (name, x, y, size, color) => {

    // Box
    ctx.fillStyle = color;
    ctx.fillRect(x - size / 2, y - size / 2, size, size);

    // Name
    ctx.font = "12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(name, x, y - (size - 2));
  };

  canvas.width = 500;
  canvas.height = 500;

  const ctx = canvas.getContext("2d");

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const myData = data.find((user) => user.isMe);

  // center lat and lng
  const centerLat = myData.lat;
  const centerLng = myData.lng;

  // Screen center position
  const centerScreenX = canvasWidth / 2;
  const centerScreenY = canvasHeight / 2;

  // Draw my position
  drawPerson(myData.name, centerScreenX, centerScreenY, gpsSize, "#013220");

  data.filter(person => !person.isMe).forEach((user) => {

    const dist = distance(user.lat, centerLat, user.lng, centerLng);

    if (dist > slider.value) {
      // Don't render people out of range.
      return;
    }

    // World cords to screen cords
    const [x, y] = world2screen(centerScreenX, centerScreenY, myData.lat, myData.lng, user.lat, user.lng);

    // Draw person
    drawPerson(user.name, x, y, gpsSize, "#ed2939");
})
};

// World cords to screen cords
const world2screen = (screenX, screenY, myLat, myLng, lat, lng) => {

  // Get delta position
  let deltaLat = (myLat - lat) * 1000;
  let deltaLng = (myLng - lng) * 1000

  // Scale with slider
  deltaLat *= (50/slider.value)
  deltaLng *= (50/slider.value)

  // Add position to delta
  const userPositionX = screenX - deltaLng;
  const userPositionY = screenY + deltaLat;

  return [userPositionX, userPositionY];
}

// Two Points on Earth
// SRC: https://www.geeksforgeeks.org/program-distance-two-points-earth/
// returns distance in KM
const distance = (lat1, lat2, lon1, lon2) => {
  // The math module contains a function
  // named toRadians which converts from
  // degrees to radians.
  lon1 = (lon1 * Math.PI) / 180;
  lon2 = (lon2 * Math.PI) / 180;
  lat1 = (lat1 * Math.PI) / 180;
  lat2 = (lat2 * Math.PI) / 180;

  // Haversine formula
  let dlon = lon2 - lon1;
  let dlat = lat2 - lat1;
  let a =
    Math.pow(Math.sin(dlat / 2), 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

  let c = 2 * Math.asin(Math.sqrt(a));

  // Radius of earth in kilometers. Use 3956
  // for miles
  let r = 6371;

  // calculate the result
  return c * r;
}

// Testing function
const createUser = async () => {
  const testLatitude = document.getElementById("testLatitude");
  const testLongtitude = document.getElementById("testLongtitude");
  const testName = document.getElementById("testName");


  const response = await fetch("/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: testName.value,
      lat: testLatitude.value,
      lng: testLongtitude.value,
    }),
  });

  const data = await response.json();
}
