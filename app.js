const express = require("express");
const app = express();
const axios = require('axios').default;
require('dotenv').config();

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
const bodyParser = require('body-parser');

app.use(bodyParser.json())
.use(bodyParser.urlencoded({
        extended: true
}));

app.get('/', (req, res) => {
    axios.get('https://api.coincap.io/v2/assets')
  .then(function (response) {
    // handle success
    const data = response.data;
    res.json(data["data"])
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })

    
})

app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
})