function interpolateColor(color1, color2, percentage) {
  const color1Arr = color1.match(/\d+/g).map(Number);
  const color2Arr = color2.match(/\d+/g).map(Number);
  const r = Math.round(color1Arr[0] + (color2Arr[0] - color1Arr[0]) * percentage);
  const g = Math.round(color1Arr[1] + (color2Arr[1] - color1Arr[1]) * percentage);
  const b = Math.round(color1Arr[2] + (color2Arr[2] - color1Arr[2]) * percentage);
  return `rgb(${r}, ${g}, ${b})`;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}


function returnColorRule(selectedRange){
  const base_color = {
    "-3": "rgb(246, 53, 56)",
    "-2": "rgb(191, 64, 69)",
    "-1": "rgb(139, 68, 78)",
    "0": "rgb(65, 69, 84)",
    "1": "rgb(53, 118, 78)",
    "2": "rgb(47, 158, 79)",
    "3": "rgb(48, 204, 90)",
  };

  const color_ranges = {
    "one_week": {
      "-6": "rgb(246, 53, 56)",
      "-4": "rgb(191, 64, 69)",
      "-2": "rgb(139, 68, 78)",
      "0": "rgb(65, 69, 84)",
      "2": "rgb(53, 118, 78)",
      "4": "rgb(47, 158, 79)",
      "6": "rgb(48, 204, 90)",
    },
    "one_month":{
      "-10": "rgb(246, 53, 56)",
      "-6.7": "rgb(191, 64, 69)",
      "-3.3": "rgb(139, 68, 78)",
      "0": "rgb(65, 69, 84)",
      "3.3": "rgb(53, 118, 78)",
      "6.7": "rgb(47, 158, 79)",
      "10": "rgb(48, 204, 90)",
    },
    "one_year": {
      "-30": "rgb(246, 53, 56)",
      "-20": "rgb(191, 64, 69)",
      "-10": "rgb(139, 68, 78)",
      "0": "rgb(65, 69, 84)",
      "10": "rgb(53, 118, 78)",
      "20": "rgb(47, 158, 79)",
      "30": "rgb(48, 204, 90)",
    },
    "ytd": {
      "-30": "rgb(246, 53, 56)",
      "-20": "rgb(191, 64, 69)",
      "-10": "rgb(139, 68, 78)",
      "0": "rgb(65, 69, 84)",
      "10": "rgb(53, 118, 78)",
      "20": "rgb(47, 158, 79)",
      "30": "rgb(48, 204, 90)",
    }
  }

  if (selectedRange in color_ranges){
    return color_ranges[selectedRange]

  }else{
    return base_color
  }
}

function returnRoundedGrowthPercentage(growthPercentage, selectedRange, testing) {
  let roundedGrowthPercentage = Math.round(growthPercentage);

  const base = 3;
  const growthRange = {
    "one_week": 6,
    "one_month": 10,
    "one_year": 60,
    "ytd": 60,
  };

  // If selectedRange is not provided or not in growthRange
  if (!selectedRange || !(selectedRange in growthRange)) {
    return applyBoundary(roundedGrowthPercentage, base);
  } else {
    const rangeLimit = growthRange[selectedRange];
    return applyBoundary(roundedGrowthPercentage, rangeLimit);
  }
}

function applyBoundary(value, limit) {
  if (value > limit) {
    return limit;
  } else if (value < -limit) {
    return -limit;
  }
  return value;
}

function returnNextColorFactor(growthPercentage, selectedRange){
  let nextColorFactor = growthPercentage > 0 ? 1 : -1;

  const base = 1;

  const growthRange = {
    "one_week": 2,
    "one_month": 3.3,
    "one_year": 20,
    "ytd": 20,
  }

  
  if(selectedRange in growthRange){
    nextColorFactor = growthPercentage > 0 ? growthRange[selectedRange] : -growthRange[selectedRange];
  }else{
    nextColorFactor = growthPercentage > 0 ? base : -base;
  }

  return nextColorFactor;
}
// function findUpperValues(list, dictionary) {
//   let result = [];

//   // Iterate over each element in the list
//   list.forEach((element) => {
//       // Check if the element exists as a key in the dictionary
//       if (dictionary.hasOwnProperty(element)) {
//           // If yes, push the corresponding value to the result array
//           result.push(element);
//       } else {
//           let nearestUpper = null;
//           let nearestLower = null;

//           // Iterate over each key in the dictionary
//           Object.keys(dictionary).forEach((key) => {
//               const dictKey = parseFloat(key);

//               // Check if the key is greater than the current element
//               if (dictKey > element) {
//                   // If nearestUpper is null or the current key is closer to the element
//                   if (nearestUpper === null || dictKey < nearestUpper) {
//                       nearestUpper = dictKey;
//                   }
//               } else {
//                   // If nearestLower is null or the current key is closer to the element
//                   if (nearestLower === null || dictKey > nearestLower) {
//                       nearestLower = dictKey;
//                   }
//               }
//           });

//           // If a nearest upper value is found, push it to the result array
//           if (nearestUpper !== null) {
//               result.push(nearestUpper);
//           } else if (nearestLower !== null) { // If no nearest upper value found, use nearest lower value
//               result.push(nearestLower);
//           }
//       }
//   });

//   return result;
// }

function findValues(list, dictionary) {
  let result = [];

  // Iterate over each element in the list
  list.forEach((element) => {
      // Check if the element exists as a key in the dictionary
      if (dictionary.hasOwnProperty(element)) {
          // If yes, push the corresponding value to the result array
          result.push(element);
      } else {
          let nearestKey = null;
          let minDifference = Infinity;

          // Iterate over each key in the dictionary
          Object.keys(dictionary).forEach((key) => {
              const dictKey = parseFloat(key);
              const difference = Math.abs(element - dictKey);

              // Check if the current difference is smaller than the minimum difference found so far
              if (difference < minDifference) {
                  minDifference = difference;
                  nearestKey = dictKey;
              }
          });

          // Push the nearest key to the result array
          result.push(nearestKey);
      }
  });

  return result;
}




function getColorByGrowthPercentage(growthPercentage, testing = false) {
  var selectedRange = document.getElementById("interval");
  var selectedRange = selectedRange.value;


  if(selectedRange !== 'one_day'){
    // let selectedRange = 'one_year'

    // color rules
    const colorRules = returnColorRule(selectedRange);


    // rouned growth percentage logic
    const roundedGrowthPercentage =  returnRoundedGrowthPercentage(growthPercentage, selectedRange, testing)
    // let roundedGrowthPercentage = Math.round(growthPercentage);
    // if (roundedGrowthPercentage > 3) roundedGrowthPercentage = 3;
    // else if (roundedGrowthPercentage < -3) roundedGrowthPercentage = -3;


    // next color factor logic
    const nextColorFactor = returnNextColorFactor(growthPercentage, selectedRange, testing)
    // const nextColorFactor = growthPercentage > 0 ? 1 : -1;


    // custom addition for the weekly cause we ware getting some issue
    let colorKeys = []
    if(selectedRange === 'one_week'){
      colorKeys = findValues([roundedGrowthPercentage + 0.01, roundedGrowthPercentage + nextColorFactor - 0.01], colorRules);
    }else{
      colorKeys = findValues([roundedGrowthPercentage, roundedGrowthPercentage + nextColorFactor], colorRules);
    }
    colorKeys.sort();

    // console.log([roundedGrowthPercentage , roundedGrowthPercentage + nextColorFactor], colorRules)
    // console.log(colorKeys)


    const lowerColor = colorRules[colorKeys[0].toString()];
    const higherColor = colorRules[(colorKeys[1] + nextColorFactor).toString()];

    if(testing){
      console.log([roundedGrowthPercentage , roundedGrowthPercentage + nextColorFactor], colorRules)
      console.log(colorKeys)
      console.log(roundedGrowthPercentage)
      console.log(nextColorFactor)
      console.log(colorKeys)
      console.log(colorRules)
      console.log(lowerColor, 'lower color')
      console.log(higherColor, 'higher color')
      console.log(growthPercentage)
    }


    // If the growth percentage is outside the provided rules, return the closest color
    if (!lowerColor || !higherColor) {
      return lowerColor || higherColor;
    }

    // Calculate the interpolation factor based on the decimal part of the growth percentage
    const interpolationFactor = growthPercentage - roundedGrowthPercentage;

    // Interpolate between the two colors
    const rgb_color =  interpolateColor(lowerColor, higherColor, interpolationFactor);
    return rgb_color;

  }else{
    const colorRules = {
      "-3": "rgb(246, 53, 56)",
      "-2": "rgb(191, 64, 69)",
      "-1": "rgb(139, 68, 78)",
      "0": "rgb(65, 69, 84)",
      "1": "rgb(53, 118, 78)",
      "2": "rgb(47, 158, 79)",
      "3": "rgb(48, 204, 90)",
    };

    const nextColorFactor = growthPercentage > 0 ? 1 : -1;

    let roundedGrowthPercentage = Math.round(growthPercentage);
    if (roundedGrowthPercentage > 3) roundedGrowthPercentage = 3;
    else if (roundedGrowthPercentage < -3) roundedGrowthPercentage = -3;

    const colorKeys = [roundedGrowthPercentage , roundedGrowthPercentage + nextColorFactor];
    colorKeys.sort();

    const lowerColor = colorRules[colorKeys[0].toString()];
    const higherColor = colorRules[(colorKeys[1] + nextColorFactor).toString()];


    // If the growth percentage is outside the provided rules, return the closest color
    if (!lowerColor || !higherColor) {
      return lowerColor || higherColor;
    }

    // Calculate the interpolation factor based on the decimal part of the growth percentage
    const interpolationFactor = growthPercentage - roundedGrowthPercentage;

    // Interpolate between the two colors
    const rgb_color =  interpolateColor(lowerColor, higherColor, interpolationFactor);
    return rgb_color;
}
}

function getHexColorByGrowthPercentage(growthPercentage) {
  const rgb_color = getColorByGrowthPercentage(growthPercentage);
  
  // Check if rgb_color is a string before using match
  if (typeof rgb_color === 'string') {
    const hex_color = rgbToHex(...rgb_color.match(/\d+/g).map(Number));
    return hex_color;
  } else {
    // Handle the case where rgb_color is not a string (e.g., it's undefined or some other type)
    return 'Invalid Color'; // You can choose an appropriate error message here
  }
}
