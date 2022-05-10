const express = require("express");
const app = express();
const port = 4001;

app.use(express.static("public"));
app.use(express.json());

let users = [];
let messages = [];

app.post("/api/generate", (req, res) => {
  console.log(req.body);

  const { name, lat, lng } = req.body;

  if (!name) {
    return res.status(400).json({
      error: "Please provide a name",
    });
  }

  if (!lat || !lng) {
    return res.status(400).json({
      error: "Invalid location",
    });
  }

  const user = {
    id: users.length,
    name,
    lat: lat ?? 0,
    lng: lng ?? 0,
    lastUpdated: new Date(),
  };

  users.push(user);

  return res.json(user);
});

app.post("/api/info", (req, res) => {
  const { id, lat, lng } = req.body;

  if (id === undefined) {
    return res.status(400).json({
      error: "Please provide an id",
    });
  }

  const userIndex = users.findIndex((user) => user.id === id);

  if(userIndex < 0)
  {
    return res.status(400).json({
      error: "User not found",
    });
  }

  if (lat) {
    users[userIndex]["lat"] = lat;
  }

  if (lng) {
    users[userIndex]["lng"] = lng;
  }

  res.json(
    users.map((user) => {
      user.isMe = user.id === id;

      return user;
    })
  );
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
