const express = require("express");
const app = express();
const axios = require('axios').default;
require('dotenv').config();
var lodash = require('lodash');

app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
const bodyParser = require('body-parser');

app.use(bodyParser.json())
.use(bodyParser.urlencoded({
        extended: true
}));

app.get('/checks', (req, res) => {
  var y = [1,2,3,4,5,6,7,8,9,10];
  var aans = y.slice(Math.max(y.length - 5, 0));
  console.log(aans);
})

app.get('/', (req, res) => {
    axios.get('https://api.coincap.io/v2/assets')
  .then(function (response) {
    // handle success
    console.log(response);
    const data = response.data["data"];
    const lossMax = [...data];
    const proMax = [...data];
    const loss = lossMax.sort(function(a,b){return a.changePercent24Hr - b.changePercent24Hr});
    const profit = proMax.sort(function(a,b){return a.changePercent24Hr - b.changePercent24Hr}).reverse();
    //res.send(data)
    res.render("home", {data, loss, profit})
  })
  .catch(function (error) {
    // handle error
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
        
        const graphData = makeGraph(graphInfo);
           
        const dmaInfo = dma(graphData.yAxis);

            res.render("detail", {coinInfo, graphInfo, xAxis:graphData.xAxis , yAxis:graphData.yAxis, dmaInfo});

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

function dma(yAxis){
  const dma50Arr = yAxis.slice(Math.max(yAxis.length - 50, 0));
            var sum50 = dma50Arr.reduce(function(a,b){
              return parseFloat(a)+parseFloat(b);
            }, 0);
            dma50 = (sum50/50).toFixed(2); 

            const dma100Arr = yAxis.slice(Math.max(yAxis.length - 100, 0))
            var sum100 = dma100Arr.reduce(function(a,b){
              return parseFloat(a)+parseFloat(b);
            }, 0);
            dma100 = (sum100/100).toFixed(2); 

            const dma200Arr = yAxis.slice(Math.max(yAxis.length - 200, 0))
            var sum200 = dma200Arr.reduce(function(a,b){
              return parseFloat(a)+parseFloat(b);
            }, 0);
            dma200 = (sum200/200).toFixed(2);
            return {dma50,dma100,dma200}
}

function makeGraph(graphInfo){
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
        return {xAxis, yAxis}
}