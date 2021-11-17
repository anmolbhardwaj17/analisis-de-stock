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
    console.log(response);
    const data = response.data["data"];
    const timeStamp = response.data["timestamp"];
    const relativeTime = timeDifference(Date.now(), timeStamp)
    console.log(data[0]);
    res.render("home", {data, relativeTime})
  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })


    
})

app.get('/:id', (req, res) => {
    const url = req.url;
    const coinName = url.substring(1, url.length);

    let gData = `https://api.coincap.io/v2/assets/${coinName}/history?interval=d1`
    let cData = `https://api.coincap.io/v2/assets/${coinName}`

    const requestOne = axios.get(gData);
    const requestTwo = axios.get(cData);


    axios.all([requestOne, requestTwo]).then(axios.spread((...responses) => {
        const responseOne = responses[0]
        const responseTwo = responses[1]

        const graphInfo = responseOne.data["data"];
        const coinInfo = responseTwo.data["data"];
        console.log(graphInfo);
        const xAxis = [];
        const yAxis = [];
        for(let i=0;i<graphInfo.length;i++){
            let str = graphInfo[i]["date"]
            let ans1 = str.substring(5,7);
            let ans2 = str.substring(2,4);
            let x = [ans1, ans2].join('-')
            xAxis.push(x)
            let y = parseFloat(graphInfo[i]["priceUsd"]).toFixed(2)
            yAxis.push(y);
            
        }
        console.log(xAxis);
        console.log(yAxis);
        res.render("detail", {coinInfo, graphInfo, xAxis, yAxis})

        // use/access the results 
      })).catch(errors => {
        // react on errors.
        console.log(errors);
      })

  


    
})

app.listen(process.env.PORT, () => {
    console.log(`Server running on http://localhost:${process.env.PORT}`);
})

function timeDifference(current, previous) {

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
         return Math.round(elapsed/1000) + ' seconds ago';   
    }

    else if (elapsed < msPerHour) {
         return Math.round(elapsed/msPerMinute) + ' minutes ago';   
    }

    else if (elapsed < msPerDay ) {
         return Math.round(elapsed/msPerHour ) + ' hours ago';   
    }

    else if (elapsed < msPerMonth) {
        return 'approximately ' + Math.round(elapsed/msPerDay) + ' days ago';   
    }

    else if (elapsed < msPerYear) {
        return 'approximately ' + Math.round(elapsed/msPerMonth) + ' months ago';   
    }

    else {
        return 'approximately ' + Math.round(elapsed/msPerYear ) + ' years ago';   
    }
}