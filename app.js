const express = require("express");
const https = require("https");
require("dotenv").config();
const app = express();
port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.get("/", (req, res) => res.sendFile(__dirname + "/public/index.html"));

app.post("/", (req, res) => {
  const fName = req.body.firstName.trim();
  const lName = req.body.lastName.trim();
  const email = req.body.emailAddress.trim();

  //mailchimp API parsing data format
  const data = {
    members: [
      {
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: fName,
          LNAME: lName,
        },
      },
    ],
  };
  const jsonData = JSON.stringify(data);

  //api url with audience id
  const url = "https://us21.api.mailchimp.com/3.0/lists/26ff3ac4fc";

  const options = {
    method: "POST",
    auth: "key:" + `${process.env.API_KEY}`,
  };

  //making https request
  const request = https.request(url, options, (response) => {
    if (
      response.statusCode === 200 &&
      [fName, lName, email].some((value) => value !== "")
    ) {
      res.sendFile(__dirname + "/public/success.html");
    } else {
      res.sendFile(__dirname + "/public/failure.html");
    }

    let data = "";

    response.on("data", (chunk) => {
      data += chunk;
    });

    response.on("end", () => {
      try {
        const parsedData = JSON.parse(data);
        // console.log(parsedData);
      } catch (error) {
        console.error("Error parsing JSON:", error);
      }
    });
  });

  request.on("error", (error) => {
    console.error("Request error:", error);
  });

  request.write(jsonData);
  request.end();
});

app.post("/success", (req, res) => {
  res.redirect("/");
});
app.post("/failure", (req, res) => {
  res.redirect("/");
});

app.listen(process.env.PORT || port, () =>
  console.log(`Server is running on port: ${port}`)
);
