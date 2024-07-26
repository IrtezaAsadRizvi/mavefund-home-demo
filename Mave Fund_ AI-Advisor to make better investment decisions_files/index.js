const topBuyElement = document.getElementById("top-buy")
const topSellElement = document.getElementById("top-sell")
const macroeconomicIndices = document.getElementById("macroeconomics-indices")
const API_URL = "https://mavefund.com/api/v1/"
const MONTHS = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

let macroeconomicIndicesData = {}
let chartTimeoutID = null

function getColorBasedOnValue(value) {
  if (value > 0)
    return "green"
  else if (value < 0)
    return "red"

  return "white"
}

function displayTable(data, element) {
  const html = `
  <table class="custom-table">
    <thead>
      <tr id="tr_ticker">
        <td>Ticker</td>
        <td class="align-right">Last Price</td>
        <td class="align-right">Change</td>
        <td class="align-right">Market Cap</td>
        <td class="align-right">Volume</td>
      </tr>
    </thead>
    <tbody>
      ${data.map(item => {
      item.company_name = item.company_name.replace("'","\\'");

      return `
      <tr>
        <td><a href="https://mavefund.com/company?key=${item.ticker}" onmouseover="getGraph(event,'${item.ticker}','${item.company_name}','${item.close}','${item.change_per}','${item.date}')" onmouseout="removeGraph()">${item.ticker}</a></td>
        <td class="align-right">${item.close}</td>
        <td class="align-right ${getColorBasedOnValue(item.change_per)}">${item.change_per}%</td>
        <td class="align-right">${parseFloat(item.market_cap) < 0.01 ? '-' : limitDecimalPlaces(parseFloat(item.market_cap))}</td>
        <td class="align-right">${item.volume}</td>
      </tr>`
  }).join("")
    }
    </tbody>
  </table>`;
  element.innerHTML += html;
}

function limitString(str, limit = 8) {
  if (!str) return ""

  if (str.length > 35) return str.slice(0, limit) + "..."

  return str
}

function displayMetrics(data, element) {
  // sorting the data by date; latest date first
  data.sort((a, b) => new Date(b.date) - new Date(a.date))

  const percentageIndices = ["FED_effective_rate", "inflation", "unemployment_rate", "wage_growth_overall", "wage_growth_unweighted_overall", "GDP_growth_rate"]

  const html = `
  <table class="custom-table">
    <thead>
      <tr id="tr_ticker">
        <td>Indices</td>
        <td class="align-right">Last Value</td>
        <td class="align-right">Growth</td>
        <td class="align-right">Date</td>
        <td class="align-right">Country</td>
      </tr>
    </thead>
    <tbody>
      ${data.map((item, i) => {
    const dateParts = item.date.split("-");
    const year = dateParts[0];
    const name = item.index.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    const month = new Date(dateParts[0], dateParts[1] - 1).toLocaleString(
      "en-US",
      { month: "short" }
    );
    const formatted_date = `${month} ${year}`;
    return `<tr>
            <td><a onmouseover="getChart(event, '${item.index}', '${name}')" onmouseleave="removeChart('${item.index}')" target='_blank' href="https://mavefund.com/economic-metrics.html?metric=${item.index}">${limitString(name,limit=35)}</a></td>
            <td class="align-right">${limitDecimalPlaces(item.value, 2) + (percentageIndices.includes(item.index) ? "%" : "")}</td>
            <td class="align-right ${getColorBasedOnValue(
      item.change_percentage
    )}">${limitDecimalPlaces(new Number(item.change_percentage)) + "%"}</td>
            <td class="align-right">${formatted_date}</td>
            <td class="align-right">${item.country}</td>
          </tr>`;
  }).join("")
    }
    </tbody>
  </table>`;
  element.innerHTML += html;
}

function createGradient(ctx, startColor) {
  let gradient = ctx.createLinearGradient(0, 0, 0, 250)
  gradient.addColorStop(0, startColor)
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0)')
  return gradient
}

function getChart(event, index, name) {
  clearTimeout(chartTimeoutID)
  chartTimeoutID = setTimeout(() => {
    plotChart(event, index, name)
  }, 200)
}

async function plotChart(event, index, name) {
  if (!macroeconomicIndicesData.hasOwnProperty(index)) {
    const url = new URL(`https://mavefund.com/api/v1/market/economic/data?metric=${index}`);

    await $.ajax({
      headers: {
        Authorization: `Bearer null`,
      },
      url: url.href,
      success: function (response) {
        macroeconomicIndicesData[index] = response.data.slice(response.data.length - 15, response.data.length).reduce((acc, { date, value }) => {
          acc.dates.push(date)
          acc.values.push(value)
          return acc
        }, { dates: [], values: [] })
      },
      error: async function (err) {
        console.log(err)
      }
    });
  }

  const { dates, values } = macroeconomicIndicesData[index]
  const parentDiv = document.createElement("div")
  parentDiv.id = `${index}-floating-chart`
  parentDiv.className = `floating-chart`
  const canvas = document.createElement("canvas");

  parentDiv.style.position = "absolute"
  parentDiv.style.padding = "10px"
  parentDiv.style.left = event.pageX + 30 + "px"
  parentDiv.style.top = event.pageY + "px"
  parentDiv.style.backgroundColor = "#22262F"
  parentDiv.style.color = "#FFFFFF"
  parentDiv.style.height = "250px"
  parentDiv.style.width = "400px"
  parentDiv.style.border = "1px solid var(--border-color)"

  canvas.style.height = "100%"
  canvas.style.width = "100%"

  parentDiv.appendChild(canvas);
  document.getElementById("indices_charts").appendChild(parentDiv)

  let ctx = canvas.getContext("2d")
  let datasets = [
    {
      label: name,
      yAxisID: "A",
      borderColor: "#F5B041",
      data: values,
      tension: 0,
      borderWidth: 1,
      pointRadius: 0,
      backgroundColor: createGradient(ctx, '#F5B041'),
    },
  ];

  const max = arrayMax(values)
  const min = arrayMin(values)
  const stepSize = (max - min) / 5

  const axes = {
    "A": {
      id: "A",
      type: "linear",
      position: "left",
      ticks: {
        fontColor: "white",
        max, min, stepSize,
        autoSkip: false
      },
      scaleLabel: {
        display: true,
        labelString: name,
        fontColor: "#F5B041",
      },
    }
  };

  const config = {
    type: "line",
    data: {
      labels: dates,
      datasets: datasets,
    },
    options: {
      maintainAspectRatio: false,
      responsive: false,
      tooltips: {
        mode: "index",
      },
      legend: {
        labels: {
          fontColor: "#ffffff",
        }
      },
      scales: {
        xAxes: [
          {
            ticks: {
              fontColor: "white",
            },
            scaleLabel: {
              display: true,
              labelString: "Dates",
              fontColor: "#FFFFFF",
            },
          }],
        yAxes: [...Object.values(axes)],
      },
    },
  };

  new Chart(ctx, config);

}

function removeChart(index) {
  clearTimeout(chartTimeoutID)
  document.querySelectorAll(".floating-chart").forEach(e => e.remove())
  const div = document.getElementById(`${index}-floating-chart`)
  if (div) div.remove()
}

function setupShowcaseCharts() {
  $.ajax({
    url: 'https://www.mavefund.com/api/v1/info/topbuysell',
    success: function (data) {
      const buyData = data.slice(0, 20)
      const sellData = data.slice(20, data.length)
      displayTable(buyData, topBuyElement)
      displayTable(sellData, topSellElement)
    }
  })
}

function displayMetricsUpdate() {
  $.ajax({
    url: 'https://mavefund.com/api/v1/market/economic/update',
    success: function (data) {
      data = data.slice(0, 20);
      displayMetrics(data, macroeconomicIndices)
    }
  })
}

async function setupSearch() {
  $("#search-input").focusout(() => {
    setTimeout(() => $("#search-results").empty(), 200)
  })

  $("#search-input").keyup(function (e) {
    const query = $(this).val();

    if (query.trim() == "") {
      $("#search-results").empty();
      return
    }

    $.ajax({
      url: `https://www.mavefund.com/api/v1/info/search?q=${query}`,
      success: function (res) {
        $("#search-results").empty();

        for (let key in res) {
          if (res[key]) {
            for (let tp of [false, true]) {
              $("#search-results").append(
                `<a class="result" href="/company?key=${key}"><span><span class="search-result-ticker">${key}</span>${res[key]}</span><span class="search-result-time-period">${tp ? "quarterly" : "yearly"}</span></a>`
              );
            }
          }
        }
      },
      error: function (err) {
        console.error(err);
      },
    });
  });
}

// function setMarketPredictionThumbnail() {
//   const predictionRequest = $.ajax({
//     url: API_URL + 'info/predictionvalues',
//     dataType: 'json',
//     success: function (result) {
//       let thumbnail = document.getElementById("predictions-thumbnail")
//       let title = document.getElementById("predictions-title")
//       const month = new Date(result[result.length - 1].date).getMonth()
//       if (result && result.length > 0 && result[result.length - 1].signal === -1) {
//         thumbnail.src = "/static/image/bear-market.jpg"
//         title.innerHTML = `Market Prediction <span style="color: red;">Bearish</span> (${MONTHS[month]} 14-${MONTHS[(month + 1) % 12]} 14)`
//       }
//       else {
//         thumbnail.src = "/static/image/bull-market.jpg"
//         title.innerHTML = `Market Prediction <span style="color: green;">Bullish</span> (${MONTHS[month]} 14-${MONTHS[(month + 1) % 12]} 14)`
//       }
//     }
//   });
// }

function formatIndexValues(values) {
  return values.map(({ time, open, high, low, close }) => {
    var offset = new Date(time).getTimezoneOffset()*60*1000;
    return {
      x: new Date(time).getTime()-offset,
      y: [open, high, low, close]
    }
  }) 
}

function findMinMax(values) {
  let yMin = Number.MAX_VALUE
  let yMax = Number.MIN_VALUE

  values.forEach(({ y }) => {
    yMin = Math.min(yMin, y[0])
    yMin = Math.min(yMin, y[1])
    yMin = Math.min(yMin, y[2])
    yMin = Math.min(yMin, y[3])

    yMax = Math.max(yMax, y[0])
    yMax = Math.max(yMax, y[1])
    yMax = Math.max(yMax, y[2])
    yMax = Math.max(yMax, y[3])
  })

  return { yMin, yMax }
}

function renderIndexChart(id, headlinesId, title, values , prev_day_close, current_price) {
  // Extracting the "time" value from the JSON response
  const timeValue = values[0].time;

  // Creating a Date object from the ISO 8601 formatted time value
  const dateObject = new Date(timeValue);

  // Getting the month and day from the dateObject
  const month = dateObject.toLocaleString("default", { month: "long" });
  const day = dateObject.getDate();

  // Combining the month and day to get "July 28" format
  const date = `${month} ${day}`;

  //getting the percentage change value from the current and the prev close
  let a = values[0];
  let b = values[values.length - 1];
  // let value = b.close - a.close;
  let value = current_price - prev_day_close;
  // let change = ((b.close /prev_day_close) -1) * 100;
  let change = (value / prev_day_close) * 100
  var closeColor=null;
  //creating the percentage changed text and css
  if(parseFloat(change)>0){
    closeColor="#00a449";
    subtitleText = parseFloat(value).toFixed(2) + ' (' + Math.round(parseFloat(change)*100)/100 +'%)';
  }
  else{
    closeColor="#fb5058";
    subtitleText = parseFloat(value).toFixed(2) + ' (' + Math.round(parseFloat(change)*100)/100 +'%)';
  }
  values = formatIndexValues(values);
  
  const { yMin, yMax } = findMinMax(values);
  var options = {
    annotations: {
      yaxis: [{
          y: current_price.toFixed(2),
          strokeDashArray: 5,
          borderColor: 'transparent',
          fillColor: 'transparent',
          opacity: 0,
          offsetX: -20,
          offsetY: -3,
          width: '120%',
          label: {
              borderColor: '#c2c2c2',
              borderWidth: 1,
              borderRadius: 2,
              text: current_price.toFixed(2),
              textAnchor: 'end',
              position: 'right',
              offsetX: 71,
              offsetY: 0,
              style: {
                  background: '#f3c736',
                  color: '#000',
                  fontWeight:600,
                  fontSize:"12px",
                  padding: {
                    left: 3,
                    right: 3,
                    top: 2,
                    bottom: 2,
                  }
              },
          },
      },
      {
        y: prev_day_close.toFixed(2),
        strokeDashArray: 5,
        borderColor: '#9d0a0c',
        fillColor: '#9d0a0c',
        opacity: 0.3,
        offsetX: 0,
        offsetY: -3,
        width: '120%',
        
    }]
    },
    series: [
      {
        data: values,
      },
    ],
    grid: {
      borderColor: "rgba(255, 255, 255, 0.25)",
      strokeDashArray: 6,
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    chart: {
      toolbar: {
        show: false,
      },
      zoom: {
        enabled: false,
      },
      type: 'candlestick',
      height: 240,
      // width: 400
    },
    title: {
      text: title,
      align: 'left',
      style: {
        color: "#929cb3",
        fontSize:"20px",            
         fontWeight:700
      }
    },
    xaxis: {
      datetimeUTC:false,
      min: getTimestampForTime(timeValue,8, 0), // Set the minimum timestamp to 9:00 AM today
      max: getTimestampForTime(timeValue,17, 0), // Set the maximum timestamp to 5:00 PM today
      labels: {
        style: {
          cssClass: "white-label",
          colors: "#929cb3"
        }
      },
      type: "datetime",
      title: {
        text: date,
        offsetX: 150,
        offsetY: -250,
        style: {
            color: undefined,
            fontSize: '14px',
            fontFamily: '"Inter", sans-serif !important',
            fontWeight: 600,
            cssClass: 'apexcharts-xaxis-title',
            color: "#929cb3"
        },
      }
    },
    yaxis: {
      opposite:"true",
      decimalsInFloat:2,
      tickAmount: 5,
      min: yMin,
      max: yMax,
      labels: {
        style: {
          colors: '#929cb3'
        },
      },
    },
    tooltip: {
      enabled: true,
      theme: "dark",
      style: {
        fontFamily: "Inter",
      },
      x: {
        show: false
      }
    },
    //will be showing the percentage change on the candlestick chart
    subtitle: {
      text: subtitleText,
      align: 'left',
      floating: false,
      style: {
        fontSize:  '18px',
        fontWeight:  '600',
        fontFamily:  '"Inter", sans-serif !important',
        color:  closeColor,
        cssClass: "candlestickSubtitle",
      }
    }
  };

  var chart = new ApexCharts(document.querySelector(`#chart-${id}`), options);
  chart.render();
  document.getElementById(`index-chart-container-${id}`).classList.remove('index-chart-hidden');
  // document.getElementById(`chart-heading-${id}`).innerHTML = `
  //   <p class="chart-heading-title">${title}</p>
  //   <p class="chart-heading-date">${date}</p>
  //   <p class="chart-heading-points">
  //     <span class="chart-heading-value ${getColorBasedOnValue(change)}">${limitDecimalPlaces(value)}</span>
  //     <span class="chart-heading-change ${getColorBasedOnValue(change)}">(${limitDecimalPlaces(change)}%)</span>
  //   </p>  
  // `
  
}

function getTimestampForTime(currentDate,hours, minutes) {
  const now = new Date(currentDate);
  now.setHours(hours, minutes, 0, 0);
  let offset = new Date().getTimezoneOffset()*60*1000;
  return now.getTime()-offset;
}

function formatDate(dateString) {
  if (dateString === null)
    return "";

  if (dateString.slice(-1) !== "Z") dateString += "Z";
  let m = new Date(dateString);
  let out =
    m.getFullYear() + "/" +
    ("0" + (m.getMonth() + 1)).slice(-2) + "/" +
    ("0" + m.getDate()).slice(-2) + " " +
    ("0" + m.getHours()).slice(-2) + ":" +
    ("0" + m.getMinutes()).slice(-2);

  return out;
}

async function renderIndexes(response) {
  try {
    // const response = await $.get('https://mavefund.com/api/v1/market/indices/values');
    const indicesData = response.map(item => {
      const indexName = Object.keys(item)[0];
      const indexData = item[indexName];
      return { indexName, ...indexData };
    });
    console.log(indicesData);
    indicesData.forEach((data, i) => {
      const { indexName, values, prices } = data;
      renderIndexChart(
        i + 1,
        `headlines-${i + 1}`,
        tickerMapper[indexName],
        values,
        prices.prev_close,
        prices.current_price
      );
    });
  } catch (error) {
    // Handle error here
    console.error('Error fetching data:', error);
  }
}

// async function getNews(){
//   $.get('https://mavefund.com/api/v1/market/indices/list', (data, status) => {
//     if (data) {
//       const { indices } = data;
//     for (let i = 0; i < indices.length; i++) {
//       let modifiedTitle = tickerMapper[indices[i]].replace(/&/g, "");
//       modifiedTitle = modifiedTitle + " index";
//       $.get(`https://mavefund.com/api/v1/market/googlenews?query=${modifiedTitle}&total_results=2`, (data, status) => {
//         if (!data || !data.news || data.news.length == 0) {
//           return;
//         }

//           const news = data.news;

//           // sorting by datetime
//           news.sort(function (a, b) {
//             return new Date(b.datetime) - new Date(a.datetime);
//           });

//           let newsCounter = 0;

//           news.forEach(({ date, datetime, link, title, media }) => {
//             // Determine if the current news item is even or odd based on the newsCounter
//             const isEven = newsCounter % 2 === 0;

//             // Create a new <div> element with appropriate class based on isEven
//             const newsElement = document.createElement('div');
//             newsElement.classList.add('news');
//             if (isEven) {
//               newsElement.style.backgroundColor = 'var(--secondary-color)';
//             }

//             // Set the content of the news element
//             newsElement.innerHTML = `
//               <span class="news-date">${date}</span><a target="_blank" href="https://www.${link}" class="news-title">${title}<span class="news-media">(${media})</span></a>
//             `;

//             // Increment the newsCounter for the next iteration
//             newsCounter++;

//             // Append the news element to the 'news-main' div
//             document.getElementById('news-main').appendChild(newsElement);
//           });
//         }
//       );
//     }
//     }
//   })
  
// }


async function getAPIdata() {
  const apiUrl = 'https://mavefund.com/api/v1/market/indices/values';

  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching API data:', error);
    return null;
  }
}

  


//onloadfun
$(document).ready(function () {
  // renderIndexes(initialIndicesData);
  // getNews();
  // this is the code that is used to update the index data every minute, 1 sec = 1000 millisec.


  // setMarketPredictionThumbnail()
  // setupShowcaseCharts();
  // displayMetricsUpdate();
  // runTreemap(true,false,"treemap")
  //runTreemapsector(true,false, "treemap", "Industrials")
  //      runTreemapsector(true,false, "treemap1", "Healthcare")
  //      runTreemapsector(true,false, "treemap2", "Technology")
  //      runTreemapsector(true,false, "treemap3", "Communication Services")
  //      runTreemapsector(true,false, "treemap4", "Consumer Defensive")
  //      runTreemapsector(true,false, "treemap5", "Consumer Cyclical")
  //      runTreemapsector(true,false, "treemap6", "Basic Materials")
  //      runTreemapsector(true,false, "treemap7", "Utilities")
  //      runTreemapsector(true,false, "treemap8", "Real Estate")
  //      runTreemapsector(true,false, "treemap9", "Energy")
  //      runTreemapsector(true,false, "treemap10", "Financial Services")
  setupSearch()
  setInterval(() => {
    getAPIdata().then(data => {
      if (data) {
        renderIndexes(data)
      }
    });
    // renderIndexes();
  }, 60000);
  // document.querySelector(".anychart-credits").remove();
});

function runTreemapsector(enableLegend, quarterly, parentId, Sector) {
  const capitalizedSector = Sector.toUpperCase();
  // Helper functions
  var GColor = function (r, g, b) {
    r = typeof r === "undefined" ? 0 : r;
    g = typeof g === "undefined" ? 0 : g;
    b = typeof b === "undefined" ? 0 : b;
    return { r: r, g: g, b: b };
  };
  var createColorRange = function (c1, c2) {
    var colorList = [],
      tmpColor;
    for (var i = 0; i < 255; i++) {
      tmpColor = new GColor();
      tmpColor.r = c1.r + (i * (c2.r - c1.r)) / 255;
      tmpColor.g = c1.g + (i * (c2.g - c1.g)) / 255;
      tmpColor.b = c1.b + (i * (c2.b - c1.b)) / 255;
      colorList.push(tmpColor);
    }
    return colorList;
  };
  var red = GColor(200, 0, 0);
  var green = GColor(0, 200, 0);
  var grey = GColor(40, 40, 40);
  const redRange = createColorRange(grey, red);
  const greenRange = createColorRange(grey, green);

  function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  }

  function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
  }

  let maxValue = 100;
  let minValue = 100;
  const valueToHex = (value) => {
    if (value >= 0) {
      let normalizedValue = Math.round(value * (254 / maxValue));
      if (normalizedValue > 254) {
        normalizedValue = 254;
      }
      const rangeColor = greenRange[normalizedValue];
      return rgbToHex(
        Math.round(rangeColor.r),
        Math.round(rangeColor.g),
        Math.round(rangeColor.b)
      );
    } else {
      value *= -1;
      let normalizedValue = Math.round(value * (254 / minValue));
      if (normalizedValue > 254) {
        normalizedValue = 254;
      }
      const rangeColor = redRange[normalizedValue];
      return rgbToHex(
        Math.round(rangeColor.r),
        Math.round(rangeColor.g),
        Math.round(rangeColor.b)
      );
    }
  };
  // Fetch data
  let chart_data = [];

  //url = filterDataloc(quarterly, Country);
  const value = Sector;
  const decodeValue = decodeURIComponent(value);
  const url = `https://mavefund.com/api/v1/info/treemap/data?quarterly=False&key=sector&value=${decodeValue}`;
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      data = data.filter((item) => {
        //Reset container
        container_ins = document.getElementById(parentId);
        container_ins.innerHTML = "";
        // Filter out incomplete data
        if (
          item.g_eps_perc_over_1_year_average &&
          item.gp_revenue_usd_mil &&
          item.industry &&
          item.sector
        ) {
          if (item.g_eps_perc_over_1_year_average > 0) {
            return item.g_eps_perc_over_1_year_average < maxValue;
          }
          if (item.g_eps_perc_over_1_year_average < 0) {
            return Math.abs(item.g_eps_perc_over_1_year_average) < minValue;
          }
        }
        return false;
      });

      // Rename data keys so it fits the chart input
      const renamed_data = [];
      data.forEach((data_point) => {
        renamed_data.push({
          name: data_point.ticker,
          value: data_point.g_eps_perc_over_1_year_average,
          size: data_point.gp_revenue_usd_mil,
          sector: data_point.sector,
          industry: data_point.industry,
          country: data_point.country,
          company_name: data_point.company_name,
          normal: {
            fill: valueToHex(data_point.g_eps_perc_over_1_year_average),
          },
        });
      });


      const result = renamed_data.reduce(function (r, a) {
        r[a.sector] = r[a.sector] || [];
        r[a.sector].push(a);
        return r;

      }, {});

      const chart_data = [];


      for (let item in result) {
        const itemsToAppend = result[item].slice(0, 20); // Extract the first 20 items

        chart_data.push({
          name: capitalizedSector,
          children: itemsToAppend,
          normal: {
            header: {
              background: "#801705",
              fontSize: "14px",
            }
          }
        });
      }



      // Function to generate a random RGB color
      chart = anychart.treeMap(chart_data, "as-tree");

      var customColorScale = anychart.scales.linearColor();
      customColorScale.colors([
        valueToHex(-minValue),
        valueToHex(0),
        valueToHex(maxValue),
      ]);

      // apply the custom color scale to the treemap chart
      chart.colorScale(customColorScale);

      // set the container id
      chart.container(parentId);
      chart.maxDepth(3);

      // Show revenue and EPS in tooltip
      chart
        .tooltip()
        .format(
          `{%company_name} \n USD Revenue in Mil: {%size} \n EPS YOY %: {%value}`
        );

      chart.labels().useHtml(true);

      // configure labels
      chart.labels().format(
        "<span style='font-weight:bold; color:#eeeeee'>{%name}</span><br><span style='color:#eeeeee'>{%value}%</span>"
      );

      // Adjust Headers
      chart.maxHeadersHeight("20");
      chart.normal().headers().fontColor("#ffffff");
      chart.normal().headers().fontWeight("bold");
      chart.normal().headers().fontSize("8");
      //chart.normal().headers().textTransform("uppercase");
      // chart.normal().headers().background("#222222");

      // Initiate drawing the chart
      chart.draw();

      // Remove white background from chart
      // Remove white background from chart

      var creditsElement = document.querySelector(".anychart-credits-text");

      // Check if the credits element exists
      if (creditsElement) {
        // Remove the credits element
        creditsElement.remove();
      }

      var treemapPaths = document.querySelectorAll(" path");

      treemapPaths.forEach(function (pathElement) {
        var currentFill = pathElement.getAttribute("fill");
        if (
          currentFill === "white" ||
          currentFill === "#ffffff" ||
          currentFill === "#F7F7F7"
        ) {
          pathElement.removeAttribute("fill");
          pathElement.setAttribute("fill", "transparent");
        }
        //pathElement.style.pointerEvents = "none"; // Disable pointer events to prevent hover interactions
        //pathElement.style.stroke = "none"; // Set stroke to none
        pathElement.style.stroke = "none";
      });
    });
}
document.addEventListener("DOMContentLoaded", function() {
  const tableBody = document.getElementById('table-body');
  const loadMoreButton = document.getElementById('load-more-button');
  let page = 1; // Initial page number

  // Function to load more data from the API
  function loadMoreData() {
      loadMoreButton.style.display = 'none';

      // Define the query parameters for the API request (e.g., page, limit)
      const queryParams = {
          parse:true
      };

      // Convert the query parameters object to a URL-encoded string
      const queryString = new URLSearchParams(queryParams).toString();

      // Create the complete API URL with query parameters
      const apiUrl = `https://mavefund.com/api/v1/info/get_weekly_outlook?${queryString}`;

      fetch(apiUrl)
          .then(response => response.json())
          .then(data => {
              // If data is empty, hide the "Load More" button
              if (data.length === 0) {
                  loadMoreButton.style.display = 'none';
                  return;
              }
              // Loop through the retrieved data and append it to the table
              data.forEach(row => {
                  const newRow = document.createElement('tr');
                  newRow.innerHTML = `
                      <td class="align-left hover-td" data-hover-text="${row.full_name}">
                          ${row.link !== '' ? `<a href="${row.link}" style="color: var(--hightlight-color);">${row.name}</a>` : `${row.name}`}
                      </td>
                      <td class="align-right">${row.description}</td>
                      <td class="align-right">${row.date}</td>
                      <td class="align-right">${row.type}</td>
                  `;
                  tableBody.appendChild(newRow);
              });

              page++; // Increment the page number for the next load
          })
          .catch(error => {
              console.error('Error:', error);
          });
  }

  // Add a click event listener to the "Load More" button
  loadMoreButton.addEventListener('click', loadMoreData);

});

