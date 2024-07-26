function showDropdown() {
  var countryDropdown = document.getElementById("countryDropdown");
  var elements = document.querySelectorAll("[id^='treemap-containermap']");
  var image = document.getElementsByClassName("bg-map");
  var Map = document.getElementById("treemap-container");
  countryDropdown.style.display = "block";
  image[0].style.display = "none";
  Map.style.display = "block";
  elements.forEach(function (element) {
    element.style.display = "none";
  });
}

function hideDropdown() {
  var radioBtn = document.querySelector(
    'input[name="options"][value="worldwide"]'
  );
  var elements = document.querySelectorAll("[id^='treemap-containermap']");
  if (radioBtn.checked) {
    runTreemapLoc(true, false, "treemap-map1", "China");
    runTreemapLoc(true, false, "treemap-map2", "India");
    runTreemapLoc(true, false, "treemap-map3", "Mexico");
    runTreemapLoc(true, false, "treemap-map4", "Bermuda");
    runTreemapLoc(true, false, "treemap-map5", "United Kingdom");
    runTreemapLoc(true, false, "treemap-map6", "Japan");
    runTreemapLoc(true, false, "treemap-map7", "Taiwan");
    runTreemapLoc(true, false, "treemap-map8", "Australia");
    runTreemapLoc(true, false, "treemap-map9", "South Africa");
    runTreemapLoc(true, false, "treemap-map10", "Israel");
    runTreemapLoc(true, false, "treemap-map11", "Denmark");
    runTreemapLoc(true, false, "treemap-map12", "Ireland");
    runTreemapLoc(true, false, "treemap-map13", "Spain");
    runTreemapLoc(true, false, "treemap-map14", "Brazil");
    runTreemapLoc(true, false, "treemap-map15", "Netherlands");
    runTreemapLoc(true, false, "treemap-map16", "Switzerland");
    runTreemapLoc(true, false, "treemap-map17", "France");
    // runTreemapLoc(true, false, "treemap-map18", "Belgium");
    runTreemapLoc(true, false, "treemap-map19", "Luxembourg");
    runTreemapLoc(true, false, "treemap-map20", "Italy");
    runTreemapLoc(true, false, "treemap-map21", "Germany");
    runTreemapLoc(true, false, "treemap-map22", "Cayman Islands");
    runTreemapLoc(true, false, "treemap-map23", "Colombia");
    runTreemapLoc(true, false, "treemap-map24", "Argentina");
    runTreemapLoc(true, false, "treemap-map25", "Canada");
    runTreemapLoc(true, false, "treemap-map26","Chile");
    runTreemapLoc(true, false, "treemap-map27", "Peru");
    // runTreemapLoc(true, false, "treemap-map28", "Panama");
    // runTreemapLoc(true, false, "treemap-map29", "South korea");
    // runTreemapLoc(true, false, "treemap-map30", "Singapore");
    // //runTreemapLoc(true, false, "treemap-map31","Philiphines");
    // runTreemapLoc(true, false, "treemap-map32", "Indonesia");
    // //runTreemapLoc(true, false, "treemap-map33","Hongcong");
    elements.forEach(function (element) {
      element.style.display = "block";
    });
  }
  var countryDropdown = document.getElementById("countryDropdown");

  var Map = document.getElementById("treemap-container");
  var images = document.getElementsByClassName("bg-map");
  countryDropdown.style.display = "none";

  Map.style.display = "none";
  images[0].style.display = "block";
}

function hideDropdown1() {
  var countryDropdown = document.getElementById("countryDropdown");
  var elements = document.querySelectorAll("[id^='treemap-containermap']");
  var Map = document.getElementById("treemap-container");
  var images = document.getElementsByClassName("bg-map");
  countryDropdown.style.display = "none";
  images[0].style.display = "none";
  Map.style.display = "block";
  elements.forEach(function (element) {
    element.style.display = "none";
  });

  runTreemap(true, false, "treemap-main", "treemap-page")
}

function runTreemap(enableLegend, quarterly, containerId, page, data = null) {
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

  //  if else condition written for jinja templating
  //  if there is data is not null means that its getting value already soo no need to fetch data
  //  else fetch data from api

  if (data !== null) {
    data = data.filter((item) => {
      // Filter out incomplete data
      if (
        item.marketcap &&
        item.growth_percentage &&
        item.industry &&
        item.sector
      ) {
        if (item.growth_percentage > 0) {
          return item.growth_percentage < maxValue;
        }
        if (item.growth_percentage < 0) {
          return Math.abs(item.growth_percentage) < minValue;
        }
      }
      return false;
    });

    // Rename data keys so it fits the chart input
    const renamed_data = [];
    data.forEach((data_point) => {
      renamed_data.push({
        name: data_point.ticker,
        value: data_point.growth_percentage,
        size: data_point.marketcap,
        sector: data_point.sector,
        industry: data_point.industry,
        company_name: data_point.company_name,
        normal: {
          fill: valueToHex(data_point.growth_percentage),
        },
      });
    });

    const result = renamed_data.reduce(function (r, a) {
      r[a.sector] = r[a.sector] || [];
      r[a.sector].push(a);
      return r;
    }, Object.create(null));

    for (item in result) {
      chart_data.push({ name: item, children: result[item] });
    }

    const final_data = [];
    chart_data.forEach((chart_sector) => {
      const industries = chart_sector.children.reduce(function (r, a) {
        r[a.industry] = r[a.industry] || [];
        r[a.industry].push(a);
        return r;
      }, Object.create(null));
      const sector_children = [];

      for (item in industries) {
        let valueSum = 0;
        industries[item].forEach((point) => {
          valueSum += point.value;
        });

        const valueAverage = valueSum / industries[item].length;
        sector_children.push({
          name: item,
          children: industries[item],
          normal: { header: { background: valueToHex(valueAverage) } },
        });
      }
      const sector = {
        name: chart_sector.name,
        children: sector_children,
        normal: { header: { background: "#333333" } },
      };
      final_data.push(sector);
    });

    var data = [
      {
        name: "ESP yearly growth over Revenue in USD Mil",
        children: final_data,
        normal: { header: { background: "#333333" } },
      },
    ];

    generateTreeMap({
      data,
      containerId,
      // enableLegend,
      page,
    });
  } else {
    url = filterData(quarterly)
      .then((url) => fetch(url))
      .then((res) => res.json())
      .then((data) => {
        data = data.filter((item) => {
          // Filter out incomplete data
          if (item.growth_percentage && item.industry && item.sector) {
            if (item.growth_percentage > 0) {
              return item.growth_percentage < maxValue;
            }
            if (item.growth_percentage < 0) {
              return Math.abs(item.growth_percentage) < minValue;
            }
          }
          return false;
        });

        // Rename data keys so it fits the chart input
        const renamed_data = [];
        data.forEach((data_point) => {
          renamed_data.push({
            name: data_point.ticker,
            value: data_point.growth_percentage,
            size: data_point.marketcap,
            sector: data_point.sector,
            industry: data_point.industry,
            company_name: data_point.company_name,
            normal: {
              fill: valueToHex(data_point.growth_percentage),
            },
          });
        });

        const result = renamed_data.reduce(function (r, a) {
          r[a.sector] = r[a.sector] || [];
          r[a.sector].push(a);
          return r;
        }, Object.create(null));

        for (item in result) {
          chart_data.push({ name: item, children: result[item] });
        }

        const final_data = [];
        chart_data.forEach((chart_sector) => {
          const industries = chart_sector.children.reduce(function (r, a) {
            r[a.industry] = r[a.industry] || [];
            r[a.industry].push(a);
            return r;
          }, Object.create(null));
          const sector_children = [];
          for (item in industries) {
            let valueSum = 0;
            industries[item].forEach((point) => {
              valueSum += point.value;
            });
            const valueAverage = valueSum / industries[item].length;
            sector_children.push({
              name: item,
              children: industries[item],
              normal: { header: { background: valueToHex(valueAverage) } },
            });
          }
          const sector = {
            name: chart_sector.name,
            children: sector_children,
            normal: { header: { background: "#333333" } },
          };
          final_data.push(sector);
        });

        var data = [
          {
            name: "ESP yearly growth over Revenue in USD Mil",
            children: final_data,
            normal: { header: { background: "#333333" } },
          },
        ];

        generateTreeMap({
          data,
          containerId,
          // enableLegend,
          page,
        });

        // chart = anychart.treeMap(data, "as-tree");

        // var customColorScale = anychart.scales.linearColor();
        // customColorScale.colors([
        //   valueToHex(-minValue),
        //   valueToHex(0),
        //   valueToHex(maxValue),
        // ]);

        // // apply the custom color scale to the treemap chart
        // chart.colorScale(customColorScale);

        // if (enableLegend) {
        //   // add the color range
        //   chart.colorRange().enabled(true);
        //   chart.colorRange().length("100%");
        // }

        // // set the container id
        // chart.container(parentId);
        // chart.maxDepth(3);

        // // Show revenue and EPS in tooltip
        // chart
        //   .tooltip()
        //   .format(
        //     `{%company_name} \n USD Revenue in Mil: {%size} \n EPS YOY %: {%value}`
        //   );

        // chart.labels().useHtml(true);

        // // configure labels
        // chart
        //   .labels()
        //   .format(
        //     "<span style='font-weight:bold; color:#eeeeee'>{%name}</span><br><span style='color:#eeeeee'>{%value}%</span>"
        //   );

        // // Adjust Headers
        // chart.maxHeadersHeight("14");
        // chart.normal().headers().fontColor("#ffffff");
        // chart.normal().headers().fontWeight("bold");
        // chart.normal().headers().fontSize("8");
        // // chart.normal().headers().background("#222222");

        // // Initiate drawing the chart
        // chart.draw();

        // Remove white background from chart
        // var elem = document.querySelector('[data-ac-wrapper-id="1352"]');
        // elem.parentNode.removeChild(elem);
        // var elem = document.querySelector('[data-ac-wrapper-id="8"]');
        // elem.parentNode.removeChild(elem);
        // var treemapPaths = document.querySelectorAll(" path");

        // treemapPaths.forEach(function (pathElement) {
        //   var currentFill = pathElement.getAttribute("fill");
        //   if (
        //     currentFill === "white" ||
        //     currentFill === "#ffffff" ||
        //     currentFill === "#F7F7F7"
        //   ) {
        //     pathElement.removeAttribute("fill");
        //     pathElement.setAttribute("fill", "transparent");
        //   }
        //   //pathElement.style.pointerEvents = "none"; // Disable pointer events to prevent hover interactions
        //   //pathElement.style.stroke = "none"; // Set stroke to none
        //   pathElement.style.stroke = "none";
        // });
      });
  }
}

async function filterData(quarterly) {
  // const res = await fetch(`${window.CONFIG.API_URL}/api/v1/auth/country`);
  // const data = await res.json();
  // const country = data['country'];
  // let boundArg = "";
  // if (country && country !== "United States"){
  //   boundArg=`&bound=${country}`;
  // }
  var selectedOption = document.querySelector('input[name="options"]:checked');
  if (!selectedOption) {
    // return `${window.CONFIG.API_URL}/api/v1/info/treemap?quarterly=False${boundArg}`;
    return `${window.CONFIG.API_URL}/api/v1/info/treemap/marketcap`;
  }

  selectedOption = selectedOption.value;
  var countryDropdown = document.getElementById("countrySelect");
  var selectedCountry = countryDropdown.value;

  // Append the selected option and country to the URL
  var url = `${window.CONFIG.API_URL}/api/v1/info/treemap/marketcap?quarterly=${
    quarterly ? "True" : "False"
  }`;
  if (selectedOption === 'snp500'){
    url = url+ "&bound=" + "snp500"
  }
  else if (selectedOption === "country") {
    url = url + "&bound=" + selectedCountry;
  } else if (selectedOption === "local") {
    url = url + "&bound=" + "";
  } else if(selectedOption === 'crypto'){
    url = url + "&bound=" + "crypto"
  } else {
    url = url + "&bound=" + "";
  }

  // Request data using the constructed URL
  // Replace this line with your actual code to request data
  return url;
}

function filterDataloc(quarterly, country) {
  // var selectedOption = document.querySelector('input[name="options"]:checked');
  // if (!selectedOption) {
  //   // return 'https://mavefund.com/api/v1/info/treemap?quarterly=False'
  //   return "https://mavefund.com/api/v1/info/treemap/marketcap";
  // }

  selectedOption = "world";
  var selectedCountry = country;

  // Append the selected option and country to the URL
  var url = `https://mavefund.com/api/v1/info/treemap/marketcap?quarterly=${
    quarterly ? "True" : "False"
  }`;
  if (selectedOption === "world") {
    url = url + "&bound=" + selectedCountry;
  } else {
    url = url + "&bound=" + selectedOption;
  }

  // Request data using the constructed URL
  // Replace this line with your actual code to request data
  return url;
}

function runTreemapLoc(enableLegend, quarterly, parentId, Country) {
  // Fetch data
  let chart_data = [];
  let maxValue = 100;
  let minValue = 100;
  url = filterDataloc(quarterly, Country);
  fetch(url)
    .then((res) => res.json())
    .then((data) => {
      data = data.filter((item) => {
        //Reset container
        container_ins = document.getElementById(parentId);
        container_ins.innerHTML = "";
        // Filter out incomplete data
        if (
          item.growth_percentage &&
          item.marketcap &&
          item.industry &&
          item.sector
        ) {
          if (item.growth_percentage > 0) {
            return item.growth_percentage < maxValue;
          }
          if (item.growth_percentage < 0) {
            return Math.abs(item.growth_percentage) < minValue;
          }
        }
        return false;
      });

      data.sort((a, b) => {
        b.marketcap - a.marketcap;
      });

      data = data.slice(0, 50);

      // Rename data keys so it fits the chart input
      const renamed_data = [];
      data.forEach((data_point) => {
        renamed_data.push({
          name: data_point.ticker,
          value: data_point.growth_percentage,
          size: data_point.marketcap,
          industry: data_point.industry,
          country: data_point.country,
          company_name: data_point.company_name,
        });
      });

      const result = renamed_data.reduce(function (r, a) {
        r[a.country] = r[a.country] || [];
        r[a.country].push(a);
        return r;
      }, {});

      const chart_data = [];
      for (let item in result) {
        chart_data.push({
          name: item,
          children: result[item],
          normal: { header: { background: "transparent", fontSize: "10px" } },
        });
      }

      generateTreeMap({
        data: chart_data,
        containerId: parentId,
        // enableLegend,
        page: "treemap-world-page",
      });
    });
}
