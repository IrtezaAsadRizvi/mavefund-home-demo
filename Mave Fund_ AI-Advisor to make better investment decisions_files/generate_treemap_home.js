class DataGeometery {
  constructor({ x, y, width, height, depth }) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.depth = depth;
  }
}
// var DEBUG = true;
// console._log = console.log;
// console.log = function (...args) {
//   if (DEBUG) {
//     this._log(...args);
//   }
// };

function generateTreeMap({ data, containerId, page }) {
  const root = {
    postOrderDraw: [],
  };
  window.rootTreemap = root;

  window.rootTreemap.drawRules = {
    depth: {
      0: {
        showRect: false,
        showHeader: false,
      },
      1: {
        showRect: false,
        showHeader: true,
        headerStyle: "wedge",
        headerHeight: 10,
      },
      2: {
        showRect: false,
        showHeader: false,
        headerStyle: "none",
        headerHeight: 10,
        showToolTip: true,
      },
      3: {
        showRect: true,
        showHeader: false,
        showToolTip: true,
      },
    },
  };
  window.rootTreemap.tooltip = {
    tickers: [],
    targetTicker: {},
    heading: "",
  };

  if (page == "treemap-page") {
    window.rootTreemap.drawRules["depth"]["1"]["headerStyle"] = "only_text";
    window.rootTreemap.drawRules["depth"]["2"]["headerStyle"] = "wedge";
    window.rootTreemap.drawRules["depth"]["2"]["showHeader"] = true;
  }
  if (page == "treemap-world-page") {
    window.rootTreemap.drawRules["depth"]["0"]["showHeader"] = true;
    window.rootTreemap.drawRules["depth"]["0"]["headerStyle"] = "only_text";
    window.rootTreemap.drawRules["depth"]["0"]["headerHeight"] = 10;
    window.rootTreemap.drawRules["depth"]["1"]["showHeader"] = false;
    window.rootTreemap.drawRules["depth"]["2"]["showHeader"] = false;
    window.rootTreemap.drawRules["depth"]["3"]["showHeader"] = false;
    window.rootTreemap.drawRules["depth"]["0"]["showRect"] = false;
    window.rootTreemap.drawRules["depth"]["1"]["showRect"] = true;
    window.rootTreemap.drawRules["depth"]["2"]["showRect"] = false;
    window.rootTreemap.drawRules["depth"]["3"]["showRect"] = false;
  }
  window.rootTreemap.tickerPriceHistory = {};

  // console.log({
  //   page,
  //   depth1 : window.rootTreemap.drawRules['depth'],
  // });

  window.rootTreemap.textArray = [];
  window.rootTreemap.debug = {};

  const container = document.getElementById(containerId);

  // Initialize variables to keep track of the zoom level and zoom limits
  let zoomLevel = 1;
  const minZoom = 0.5; // Adjust as needed
  const maxZoom = 2.0; // Adjust as needed
  const originalZoom = 1; // Specify the original zoom level here

  // Initialize variables to keep track of the stage position
  let stageX = 0;
  let stageY = 0;

  // Add an event listener for the mousewheel event on the container
  container.addEventListener("wheel", (e) => {
    e.preventDefault();

    // Calculate the new zoom level based on the mouse wheel delta
    const zoomDelta = e.deltaY > 0 ? 0.1 : -0.1; // Adjust the zoom factor as needed
    const oldZoom = zoomLevel;
    zoomLevel += zoomDelta;

    // Apply the zoom limits
    zoomLevel = Math.max(minZoom, Math.min(maxZoom, zoomLevel));

    if (zoomLevel < originalZoom) {
      // If zooming out beyond the original zoom level, reset to the original zoom
      zoomLevel = originalZoom;

      // Reset the stage position to center
      stageX = 0;
      stageY = 0;
    } else {
      // Calculate the mouse position relative to the stage
      const stagePos = stage.getPointerPosition();
      const mousePos = {
        x: (stagePos.x - stageX) / oldZoom,
        y: (stagePos.y - stageY) / oldZoom,
      };

      // Calculate the new stage position to keep the mouse position centered
      stageX = stagePos.x - mousePos.x * zoomLevel;
      stageY = stagePos.y - mousePos.y * zoomLevel;
    }

    // Calculate the new stage scale based on the zoom level
    const newScale = { x: zoomLevel, y: zoomLevel };

    // Apply the new scale and position to the stage
    stage.scale(newScale);
    stage.position({ x: stageX, y: stageY });

    // Redraw the stage
    stage.batchDraw();
  });

  // ORIGINAL
  var width = container.clientWidth;
  var height = container.clientHeight;


  if (!(width * height > 0)) {
    return;
  }

  window.rootTreemap.drawRules.depth["1"].headerHeight = height * 0.02;
  window.rootTreemap.drawRules.depth["2"].headerHeight = height * 0.015;

  // create stage
  var stage = new Konva.Stage({
    container: containerId,
    width: width,
    height: height,
  });
  window.rootTreemap.stage = stage;

  data[0].geometery = new DataGeometery({
    width,
    height,
    x: 0,
    y: 0,
    depth: 0,
  });
  fillIncompleteData(data[0]);

  // create layer
  var mainlayer = new Konva.Layer();
  window.rootTreemap.layer = mainlayer;

  // console.log({data});

  // console.log(data[0].children.map(e=>[
  //   e.geometery.x,
  //   e.geometery.y,
  //   e.geometery.width,
  //   e.geometery.height,
  //   e.name
  // ]));

  drawEachChild({
    data: data[0],
    layer: mainlayer,
    depth: 0,
    parentData: {},
  });

  // add elements in the postorder draw array
  drawPostOrder(root.postOrderDraw, mainlayer);

  // addHoverEffect(stage, mainlayer);

  stage.add(mainlayer);
}

function getDepthRules(depth) {
  return window.rootTreemap.drawRules.depth["" + depth];
}

function drawEachChild({ data, layer, depth, parentData }) {
  const geometery = data.geometery;

  if (geometery.width < 2 || geometery.height < 2) {
    return;
  }

  // create a random color
  // const color = `#${Math.floor(Math.random()*16777215).toString(16)}`;
  const color = getHexColorByGrowthPercentage(data.value);

  window.rootTreemap.debug[data.name] = {
    value: data.value,
    color,
  };

  /**
   * Here are rules written to show Stock Ticker Rectangle
   */

  if (getDepthRules(depth).showRect) {
    var group = new Konva.Group({});
    if (getDepthRules(depth).showToolTip) {
      addHoverEffect(
        group,
        () => {
          window.rootTreemap.tooltip.targetTicker = data;
          window.rootTreemap.tooltip.tickers = parentData.children
            .sort((a, b) => b.size - a.size)
            .slice(0, 10);
          window.rootTreemap.tooltip.heading = parentData.name;
        },
        () => {
          window.rootTreemap.tooltip.targetTicker = null;
        }
      );
    }
    var rect = new Konva.Rect({
      x: geometery.x,
      y: geometery.y,
      width: geometery.width,
      height: geometery.height,
      fill: color,
      strokeWidth: 0,
    });

    // Listen for scroll events on the container element

    rect.on("mouseenter", () => {
      rect.stroke("yellow"); // Change the border color to yellow (you can use your desired color)
      rect.strokeWidth(2); // Set the border width
      layer.batchDraw();
    });

    // Restore the original styles on mouse leave
    rect.on("mouseleave", () => {
      rect.stroke(null); // Remove the border color
      rect.strokeWidth(0); // Remove the border width
      layer.batchDraw();
    });

    // To format Growth Percentage AKA value
    var value = data.value;
    var sign = value > 0 ? "+" : "";
    var formattedValue = sign + value.toFixed(2) + "%";

    let fontSize = parseInt(geometery.width / 5);
    let ticketToPercentageRatio = 0.75;
    var text = new Konva.Text({
      x: geometery.x + geometery.width / 2,
      y: geometery.y + geometery.height / 2,
      fontSize: fontSize,
      text: data.name,
      fill: "white",
      align: "center",
    });
    console.log("fixing ticker text width", data.name);
    while (true) {
      if (text.width() <= geometery.width) {
        break;
      }
      fontSize = fontSize * 0.75;
      text.fontSize(fontSize);
    }
    text.offsetX(text.width() / 2);
    var textValue = new Konva.Text({
      x: geometery.x + geometery.width / 2,
      y: geometery.y + geometery.height / 2 + text.height(),
      fontSize: parseInt(fontSize * ticketToPercentageRatio),
      text: formattedValue,
      fill: "white",
      align: "center",
    });
    textValue.offsetX(textValue.width() / 2);
    const textHeight = (t1, t2) => t1.height() + t2.height();
    let differenceOfHeight = rect.height() - textHeight(text, textValue);
    if (rect.height() > 0) {
      while (differenceOfHeight < 0) {
        // console.log(`fontsize adjustment =>  differenceOfHeight = ${differenceOfHeight} fontSize = ${fontSize}} rectangle.height = ${rect.height()} text.height = ${text.height()}`);
        fontSize = fontSize * 0.5;
        text.fontSize(fontSize);
        textValue.fontSize(fontSize * ticketToPercentageRatio);
        differenceOfHeight = rect.height() - textHeight(text, textValue);
      }
    }
    //calculation on y point to adjust the text
    let adjustableYPos = rect.y() + differenceOfHeight / 2;

    text.y(adjustableYPos);
    textValue.y(adjustableYPos + text.height());
    text.offsetX(text.width() / 2);
    textValue.offsetX(textValue.width() / 2);

    group.add(rect);
    group.add(text);
    group.add(textValue);
    layer.add(group);
  }

  /**
   * Here are rules written to show Industry Header
   */

  if (getDepthRules(depth).showHeader) {
    const headerStyle = getDepthRules(depth).headerStyle;
    var height = getDepthRules(depth).headerHeight || 10;
    var heightOffest = height * 0.2;
    var heightOffest = 0;
    var offsetWidth = 4;
    var group = new Konva.Group({});
    if (getDepthRules(depth).showToolTip) {
      addHoverEffect(group, () => {
        rootTreemap.tooltip.tickers = data.children
          .sort((a, b) => b.size - a.size)
          .slice(0, 10);
        rootTreemap.tooltip.heading = data.name;
      });
    }
    var rect = new Konva.Rect({
      x: geometery.x + offsetWidth / 2,
      y: geometery.y + heightOffest,
      width: geometery.width - offsetWidth,
      height: height,
      fill: color,
      // stroke: 'black',
      strokeWidth: 0,
    });

    // rect.offsetX(rect.width() / 2);
    var text = new Konva.Text({
      x: geometery.x + offsetWidth / 2 + 3,
      y: geometery.y + heightOffest,
      fontSize: height,
      fontFamily: "Sans-Serif",
      text: data.name.toUpperCase(),
      fill: "white",
      align: "left",
      // width: geometery.width - 6,
    });
    // text.offsetY(text.height() / 2);

    // if( text.width() > (geometery.width + offsetWidth) ){
    //   text.text(data.name.split(' ').map(e=>e[0]).join('.'));
    // }
    if (rect.width() < text.x() - rect.x() + text.width()) {
      text.text(
        data.name
          .split(" ")
          .map((e) => e[0])
          .join(".")
      );
    }

    while (rect.width() < text.x() - rect.x() + text.width()) {
      const _text = text.text();
      const textLength = _text.length;
      if (textLength == 0) break;
      const _new_text = _text.slice(0, textLength - 1);
      text.text(_new_text);
    }

    var wedge = new Konva.Wedge({
      x: geometery.x + 6,
      y: geometery.y + height * 2 - height * 0.2 + heightOffest,
      radius: height,
      angle: 60,
      fill: color,
      stroke: "black",
      strokeWidth: 1,
      rotation: -120,
    });

    if (wedge.height() > geometery.height - heightOffest) {
      wedge.visible(false);
    }

    if (headerStyle == "only_text") {
      wedge.visible(false);
      rect.visible(false);
      text.fontStyle("bold");
      text.y(geometery.y);
    }
    group.add(wedge);
    group.add(rect);
    group.add(text);
    window.rootTreemap.postOrderDraw.push(group);
  }

  if (data.children) {
    for (let i = 0; i < data.children.length; i++) {
      drawEachChild({
        data: data.children[i],
        layer: layer,
        depth: depth + 1,
        parentData: data,
      });
    }
  }
  geometery.layer = layer;
}

function fillIncompleteData(data) {
  // Fill size and average values and percentage growth
  fillSizeAndAverage(data);

  sortData(data);

  // Fill the percentage of all the children
  fillPercentageOfChildren(data);
}

function fillSizeAndAverage(data) {
  if (data.size && data.value) {
    fillExtraData(data);
    return;
  } else if (data.children) {
    let children = data.children;
    let size = 0;
    let oldSize = 0;
    for (let i = 0; i < children.length; i++) {
      fillSizeAndAverage(children[i]);
      size += children[i].size;
      oldSize += children[i].oldSize;
    }
    data.size = size;
    data.oldSize = oldSize;
    fillExtraData(data);
  }
}

// function fillExtraData(data){
//   if (!data.oldSize){
//     data.oldSize = data.size - data.value;
//   }
//   data.value = data.size - data.oldSize;
//   data.growthPercentage = (data.value / data.size) * 100;
// }
function fillExtraData(data) {
  if (!data.value && data.children) {
    data.value =
      data.children.map((e) => e.value * e.size).reduce((a, b) => a + b, 0) /
      data.children.map((e) => e.size).reduce((a, b) => a + b, 0);
  }
}

function sortData(data) {
  if (data.children) {
    data.children.sort((a, b) => {
      return b.size - a.size;
    });
    for (let i = 0; i < data.children.length; i++) {
      sortData(data.children[i]);
    }
  }
}

function fillPercentageOfChildren(data) {
  const parentGeometery = data.geometery;

  if (data.children) {
    const formatedData = {
      name: data.name,
      value: data.size,
      children: data.children.map((e) => ({ name: e.name, value: e.size })),
    };

    let offsetHeight = getDepthRules(data.geometery.depth).showHeader
      ? getDepthRules(data.geometery.depth).headerHeight
      : 0;
    let height = parentGeometery.height - offsetHeight;

    const ratio = 1;
    const tile = ((tile) => (node, x0, y0, x1, y1) => {
      tile(node, x0 / ratio, y0, x1 / ratio, y1);
      for (const child of node.children)
        (child.x0 *= ratio), (child.x1 *= ratio);
    })(d3.treemapSquarify.ratio(1));

    const d3_treemap_layout = d3
      .treemap()
      .size([parentGeometery.width, height])
      .padding(1)
      .tile(tile);

    const d3_treemap_data = d3_treemap_layout(d3.hierarchy(formatedData));

    for (var i = 0; i < data.children.length; i++) {
      let child = data.children[i];
      let d3_child = d3_treemap_data.children[i];

      if (child.name != d3_child.data.name) {
        console.log("Error: Names dont match");
        return;
      }

      child.geometery = new DataGeometery({
        x: d3_child.x0 + parentGeometery.x,
        y: d3_child.y0 + parentGeometery.y + offsetHeight,
        width: d3_child.x1 - d3_child.x0,
        height: d3_child.y1 - d3_child.y0,
        depth: data.geometery.depth + 1,
      });
      fillPercentageOfChildren(child);
    }
  }
}

function drawPostOrder(postOrderDraw, layer) {
  for (let i = 0; i < postOrderDraw.length; i++) {
    layer.add(postOrderDraw[i]);
  }
}

function generateFakeData(length) {
  const resolution = 5;
  const itterations = length / resolution;
  const values = [];
  const sections = [];
  for (let i = 0; i < itterations; i++) {
    sections[i] = [];
    const tens = i * resolution;
    for (let j = 0; j < resolution; j++) {
      const ones = Math.round(Math.random() * resolution);
      const value = tens + ones;
      sections[i].push(value);
    }
  }

  //swaping
  for (let i = 0; i < sections.length; i++) {
    const j = Math.round(Math.random() * 4);
    const temp = sections[i];
    sections[i] = sections[j];
    sections[j] = temp;
  }

  for (section of sections) {
    for (value of section) {
      values.push(value);
    }
  }
  return values;
}

function drawLineChart({
  x,
  y,
  width,
  height,
  color,
  strokeWidth,
  values,
  debug = false,
  backgroundColor = "white",
}) {
  const lineGroup = new Konva.Group({
    x: x,
    y: y,
  });
  console.log({ values });
  const gap = width / values.length;
  let max = 0;
  let min = Infinity;
  for (let i = 0; i < values.length; i++) {
    if (max < values[i]) {
      max = values[i];
    }
    if (min > values[i]) {
      min = values[i];
    }
  }
  const points = [];
  const gapY = height / (max - min);
  for (let i = 0; i < values.length; i++) {
    const scaledValue = (values[i] - min) * gapY;
    const _x = i * gap;
    const _y = height - scaledValue;
    points.push(_x);
    points.push(_y);
  }

  const line = new Konva.Line({
    points: points,
    stroke: color,
    strokeWidth: strokeWidth,
    lineCap: "round",
    lineJoin: "round",
  });
  const rect = new Konva.Rect({
    x: 0,
    y: 0,
    width: width + 2,
    height: height + 2,
    fill: backgroundColor,
    opacity: 0,
  });
  lineGroup.add(rect);
  lineGroup.add(line);
  if (debug) {
  }
  return lineGroup;
}

function drawTooltip(layer, mousePos) {
  var group = new Konva.Group({
    x: mousePos.x + 50,
    y: mousePos.y + 70,
  });
  var rect = new Konva.Rect({
    width: 300,
    height: 400,
    fill: "grey",
    stroke: "black",
    strokeWidth: 4,
  });
  group.add(rect);

  const heightCommon = 25;
  const heightSpecial = heightCommon;
  const minWidth = 150;
  const padding = 5;
  const heading = window.rootTreemap.tooltip.heading;
  let __targetTicker = window.rootTreemap.tooltip.tickers[0];
  if (window.rootTreemap.tooltip.targetTicker) {
    __targetTicker = window.rootTreemap.tooltip.targetTicker;
  }

  const targetTicker = {
    name: __targetTicker.name,
    description: __targetTicker.company_name,
    value: __targetTicker.value,
    color: getHexColorByGrowthPercentage(__targetTicker.value),
  };

  // Example Tickers [{name : "LLY", description : "Eli Lilly and Company", value:1.33, size: 528.28, color : "green"},]
  const tickers = window.rootTreemap.tooltip.tickers.map((e) => ({
    name: e.name,
    description: "No description",
    value: e.value,
    color: getHexColorByGrowthPercentage(e.value),
  }));
  let maxWidth = 280;
  let y = 2;
  let x = 2;
  const setSomeVariables = (elem) => {
    if (maxWidth < elem.width()) {
      maxWidth = elem.width();
    }
    y = y + elem.height() + 1;
  };

  // Draw Heading
  var headingElem = new Konva.Group({
    x: x,
    y: y,
  });
  const headingRect = new Konva.Rect({
    width: maxWidth,
    height: heightCommon,
    fill: "white",
    strokeWidth: 0,
  });
  headingElem.add(headingRect);
  const headingText = new Konva.Text({
    x: padding,
    y: padding,
    fontSize: 10,
    text: heading,
    fill: "black",
    align: "left",
  });
  headingElem.add(headingText);
  group.add(headingElem);
  setSomeVariables(headingRect);

  // Target Ticker
  var targetElem = new Konva.Group({
    x: x,
    y: y,
  });
  const targetRect = new Konva.Rect({
    width: maxWidth,
    height: heightSpecial,
    fill: targetTicker.color,
    strokeWidth: 0,
  });
  targetElem.add(targetRect);
  const targetNameText = new Konva.Text({
    x: padding,
    y: padding,
    fontSize: 20,
    text: targetTicker.name,
    fill: "white",
    align: "left",
  });
  const targetElementNameTextHeight = targetNameText.height();
  targetElem.add(targetNameText);
  const targetDescText = new Konva.Text({
    x: padding,
    y: targetNameText.height() + padding + 10,
    fontSize: 10,
    text: targetTicker.description,
    fill: "white",
    align: "left",
  });
  targetElem.add(targetDescText);
  const addLineChartAndTickerPrice = (targetElem, ticker) => {
    const draw2PriceElements = (targetElem, { open_price, price_history }) => {
      // Drawing Line chart
      // console.log("drawing line chart");
      const line = drawLineChart({
        x: maxWidth * 0.3,
        y: padding / 2,
        width: maxWidth * 0.19,
        // height : (heightSpecial/2) - (padding * 2),
        height: targetElementNameTextHeight,
        color: "white",
        strokeWidth: 2,
        values: price_history,
        backgroundColor: targetTicker.color,
      });
      targetElem.add(line);

      // Drawing Ticker Price
      const targetSizeText = new Konva.Text({
        x: maxWidth * 0.5,
        y: padding,
        fontSize: 20,
        text: "" + open_price,
        fill: "white",
        align: "left",
      });
      targetElem.add(targetSizeText);
    };
    if (window.rootTreemap.tickerPriceHistory[ticker]) {
      draw2PriceElements(
        targetElem,
        window.rootTreemap.tickerPriceHistory[ticker]
      );
      return;
    } else {
      fetch(
        `${window.CONFIG.API_URL}/api/v1/market/stock/${ticker}/price/history`
      )
        .then((data) => data.json())
        .then((data) => {
          const open_price = data.open_price;
          const price_history = data.history;
          window.rootTreemap.tickerPriceHistory[ticker] = {
            open_price,
            price_history,
          };
          draw2PriceElements(
            targetElem,
            window.rootTreemap.tickerPriceHistory[ticker]
          );
        });
    }
  };
  addLineChartAndTickerPrice(targetElem, targetTicker.name);
  const value = targetTicker.value;
  const sign = value > 0 ? "+" : "";
  const formattedValue = sign + value.toFixed(2) + "%";
  const targetvalueText = new Konva.Text({
    x: maxWidth * 0.75,
    y: padding,
    fontSize: 20,
    text: formattedValue,
    fill: "white",
    align: "left",
  });
  targetElem.add(targetvalueText);

  group.add(targetElem);
  setSomeVariables(targetRect);

  // Each Ticker
  for (var ticker of tickers) {
    var tickerElem = new Konva.Group({
      x: x,
      y: y,
    });
    const tickerRect = new Konva.Rect({
      width: maxWidth,
      height: heightCommon,
      fill: "white",
      strokeWidth: 0,
    });
    tickerElem.add(tickerRect);
    const tickerNameText = new Konva.Text({
      x: padding,
      y: padding,
      fontSize: 15,
      text: ticker.name,
      fill: "black",
      align: "left",
    });
    tickerElem.add(tickerNameText);
    const addLineChartAndTickerPrice_for_ticker = (
      lCPlaceElem,
      ticker,
      bgcolor
    ) => {
      const draw2PriceElements = (
        lCElem,
        { open_price, price_history },
        _bgcolor
      ) => {
        // Drawing Line chart
        const tickerLine = drawLineChart({
          x: maxWidth * 0.3,
          y: padding / 2,
          width: maxWidth * 0.19,
          // height : (heightSpecial/2) - (padding * 2),
          height: targetElementNameTextHeight,
          color: "black",
          strokeWidth: 1,
          values: price_history,
          backgroundColor: _bgcolor,
        });
        lCElem.add(tickerLine);
        const tickerSizeText = new Konva.Text({
          x: maxWidth * 0.5,
          y: padding,
          fontSize: 15,
          text: "" + open_price,
          fill: "black",
          align: "left",
        });
        lCElem.add(tickerSizeText);
      };
      if (window.rootTreemap.tickerPriceHistory[ticker]) {
        draw2PriceElements(
          lCPlaceElem,
          window.rootTreemap.tickerPriceHistory[ticker]
        );
        return;
      } else {
        fetch(
          `${window.CONFIG.API_URL}/api/v1/market/stock/${ticker}/price/history`
        )
          .then((data) => data.json())
          .then((data) => {
            const open_price = data.open_price;
            const price_history = data.history;
            window.rootTreemap.tickerPriceHistory[ticker] = {
              open_price,
              price_history,
            };
            draw2PriceElements(
              lCPlaceElem,
              window.rootTreemap.tickerPriceHistory[ticker]
            );
          });
      }
    };
    addLineChartAndTickerPrice_for_ticker(
      tickerElem,
      ticker.name,
      tickerElem.color
    );
    const value = ticker.value;
    const sign = value > 0 ? "+" : "";
    const formattedValue = sign + value.toFixed(2) + "%";
    const tickerValueText = new Konva.Text({
      x: maxWidth * 0.75,
      y: padding,
      fontSize: 15,
      text: formattedValue,
      fill: ticker.color,
      align: "left",
    });
    tickerElem.add(tickerValueText);

    group.add(tickerElem);
    setSomeVariables(tickerRect);
  }

  rect.width(maxWidth + 4);
  rect.height(y);
  layer.add(group);
  return group;
}

function addHoverEffect(layer, onHover, onOut) {
  if (!onHover) {
    onHover = () => {};
  }
  if (!onOut) {
    onOut = () => {};
  }
  let tooltip = null;

  layer.on("mouseover", function (evt) {
    onHover();
    const mousePos = window.rootTreemap.stage.getPointerPosition();
    tooltip = drawTooltip(window.rootTreemap.layer, mousePos);
    determineTooltipPosition(mousePos);
  });

  layer.on("mouseout", function (evt) {
    onOut();
    if (tooltip) {
      tooltip.hide();
      tooltip.destroy();
      tooltip = null;
    }
  });

  function determineTooltipPosition(mousePos) {
    const windowCenterX = window.innerWidth / 2;
    const windowCenterY = window.innerHeight / 2;

    if (mousePos.x < windowCenterX) {
      // Show tooltip to the right
      tooltip.position({
        x: mousePos.x + 50,
        y: mousePos.y + 50,
      });
    } else {
      // Show tooltip to the left
      tooltip.position({
        x: mousePos.x - 200,
        y: mousePos.y - 200,
      });
    }

    if (mousePos.y < windowCenterY) {
      // Show tooltip below
      tooltip.position({
        x: tooltip.x(),
        y: mousePos.y + 20,
      });
    } else {
      // Show tooltip above
      tooltip.position({
        x: tooltip.x() - 100,
        y: mousePos.y - 290 - tooltip.height() * 0.99,
      });
    }
  }
}
