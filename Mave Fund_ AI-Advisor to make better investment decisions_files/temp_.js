// Function to make API request
function fetchWeeklyOutlook() {
  fetch('https://mavefund.com/api/v1/info/get_homepage_weekly_outlook')
    .then(response => response.json())
    .then(data => {
      // Call function to generate HTML based on data
      generateWeeklyOutlookHTML(data);
    })
    .catch(error => console.error('Error fetching data:', error));

}


function setDisplay(selector, displayValue) {
  
  var element = document.querySelector(selector);
  if (element) {
    element.style.display = displayValue;
  } else {
    console.error("Element not found with selector:", selector);
  }
}

// Function to generate HTML for weekly outlook
function generateWeeklyOutlookHTML(weeklyData) {
  const container = document.querySelector('.weekly_outlook');

  // container.innerHTML = ''; // Clear previous content
  weeklyData.forEach(mainRow => {
    const slide = document.createElement('div');
    slide.className = 'weekly-oulook-mySlides';
    slide.onmouseover = weekly_pauseCarousel;
    slide.onmouseout = weekly_resumeCarousel;

    mainRow.forEach(row => {
      const weeklyContainer = document.createElement('div');
      weeklyContainer.className = 'container-for-weekly';

      const table = document.createElement('table');
      table.className = 'custom-table weekly';
      const thead = document.createElement('thead');
      const tbody = document.createElement('tbody');
      const trHeader = document.createElement('tr');
      const trBody = document.createElement('tr');

      const tdName = document.createElement('td');
      tdName.textContent = 'Name';
      tdName.className = 'align-left'
      trHeader.appendChild(tdName);

      if (row.type === 'Economic') {
        const tdDescription = document.createElement('td');
        tdDescription.className = 'align-left';
        tdDescription.textContent = 'Description';
        trHeader.appendChild(tdDescription);
      } else {
        const tdFiscalQuarter = document.createElement('td');
        tdFiscalQuarter.className = 'align-left hover-td';
        tdFiscalQuarter.dataset.hoverText = 'Fiscal Quarter Ending';
        tdFiscalQuarter.textContent = 'Fiscal Qu..';
        trHeader.appendChild(tdFiscalQuarter);
      }

      const tdDate = document.createElement('td');
      tdDate.className = 'align-left';
      tdDate.textContent = 'Date';
      trHeader.appendChild(tdDate);

      const tdType = document.createElement('td');
      tdType.className = 'align-left';
      tdType.textContent = 'Type';
      trHeader.appendChild(tdType);

      let description = row.description.slice(0, 20)

      if (description.length >= 20) {
        description = description.slice(0, 17)
        description += '...'
      }

      let full_name = row.full_name.slice(0, 15)

      if (full_name.length >= 15) {
        full_name = full_name.slice(0, 12)
        full_name += '...'
      }

      trBody.innerHTML = `
          <td class="align-left hover-td" data-hover-text="${row.full_name}" style="margin-left: 5px;">
            ${row.link !== '' ? `<a href="${row.ticker_link}" style="color: var(--hightlight-color);" target="_blank">${full_name}</a>` : full_name}
          </td>
          <td class="align-left hover-td" data-hover-text="${row.description}" style="text-align: left;">${description}</td>
          <td class="align-left">${row.outlook_date}</td>
          <td class="align-left">${row.type}</td>
        `;

      thead.appendChild(trHeader);
      tbody.appendChild(trBody);
      table.appendChild(thead);
      table.appendChild(tbody);
      weeklyContainer.appendChild(table);

      const newsCardWrapper = document.createElement('div');
      newsCardWrapper.className = 'news-card-wrapper';
      newsCardWrapper.style.maxWidth = '725px';
      newsCardWrapper.innerHTML = `
          <div class="news-card1">
            <div class="left-section">
              <div class="news-source-dynamic">
                <img src="${row.company_logo}" alt="">
              </div>
              <div class="news-title-dynamic">
                <a href="${row.news_link}" target="_blank">${row.title}</a>
              </div>
              <div class="news-date-dynamic">${row.date}</div>
            </div>
            <div class="right-section">
              <img src="${row.img}" alt="News Image">
            </div>
          </div>
        `;

      weeklyContainer.appendChild(newsCardWrapper);
      slide.appendChild(weeklyContainer);
    });

    container.appendChild(slide);
  });

  // Generate slide indicators
  const indicatorContainer = document.createElement('div');
  indicatorContainer.className = 'weekly-indicator-container';

  // Append the indicator container to the main container
  container.appendChild(indicatorContainer);

  indicatorContainer.innerHTML = ''; // Clear previous indicators
  weeklyData.forEach((mainRow, index) => {
    const indicator = document.createElement('span');
    indicator.className = 'weekly-outlook-slide-indicator';
    indicator.onclick = () => currentSlideOutlook(index + 1);
    indicatorContainer.appendChild(indicator);
  });



  var weekly_index = 0;
  weekly_carousel();

  function weekly_carousel() {
    var i;
    var weekly_slides = document.getElementsByClassName("weekly-oulook-mySlides");
    let weekly_indicators = document.getElementsByClassName("weekly-outlook-slide-indicator");

    for (i = 0; i < weekly_slides.length; i++) {
      weekly_slides[i].style.display = "none";
      weekly_indicators[i].className = weekly_indicators[i].className.replace(" indicator-active", "");

    }
    weekly_index++;
    if (weekly_index > weekly_slides.length) { weekly_index = 1 }
    weekly_slides[weekly_index - 1].style.display = "flex";
    weekly_indicators[weekly_index - 1].className += " indicator-active";

    weekly_setTimeout = setTimeout(weekly_carousel, 10000); // Change image every 2 seconds
  }

  
  const weekly_outlook_parrent_div = document.querySelector(".weekly_outlook-indicator-container-arrow")
  const weekly_outlook_arrowElementRight = weekly_outlook_parrent_div.querySelector('.go-right');
  const weekly_outlook_arrowElementLeft = weekly_outlook_parrent_div.querySelector('.go-left');

    weekly_outlook_arrowElementRight.addEventListener('click', function() {
      weekly_index++;
        if (weekly_index > document.getElementsByClassName("weekly-oulook-mySlides").length) {
          weekly_index = 1;
        }
        currentSlideOutlook(weekly_index);
    });

    weekly_outlook_arrowElementLeft.addEventListener('click', function() {
        weekly_index--;
        if (weekly_index < 1) {
          weekly_index = document.getElementsByClassName("weekly-oulook-mySlides").length;
        }
        currentSlideOutlook(weekly_index);
    });




  function weekly_pauseCarousel() {
    clearTimeout(weekly_setTimeout);
  }

  function weekly_resumeCarousel() {
    weekly_setTimeout = setTimeout(weekly_carousel, 10000);
  }
  // setDisplay()
}

// Function to make API request
function fetchTopGainerLoser() {

  fetch('https://mavefund.com/api/v1/info/get_homepage_topgainerloser')
    .then(response => response.json())
    .then(data => {
      // Call function to generate HTML based on data
      generateTopGainerLoserHTML(data);
    })
    .catch(error => console.error('Error fetching data:', error));

}

// Function to generate HTML for top gainer/loser section
function generateTopGainerLoserHTML(topGainerLoserData) {
  const container = document.querySelector('.topgainerloser');
  // container.innerHTML = ''; // Clear previous content

  topGainerLoserData.forEach(mainRow => {
    const slide = document.createElement('div');
    slide.className = 'topgainerloser-mySlides';

    mainRow.forEach(row => {
      const gainerContainer = document.createElement('div');
      gainerContainer.className = 'container-for-gainer';
      gainerContainer.onmouseover = topgainer_pauseCarousel;
      gainerContainer.onmouseout = topgainer_resumeCarousel;

      const table = document.createElement('table');
      table.className = 'custom-table gainer';
      const thead = document.createElement('thead');
      const tbody = document.createElement('tbody');
      const trHeader = document.createElement('tr');
      const trBody = document.createElement('tr');

      const tdTicker = document.createElement('td');
      tdTicker.textContent = 'Ticker';
      trHeader.appendChild(tdTicker);

      const tdLastPrice = document.createElement('td');
      tdLastPrice.className = 'align-right';
      tdLastPrice.textContent = 'Last Price';
      trHeader.appendChild(tdLastPrice);

      const tdChange = document.createElement('td');
      tdChange.className = 'align-right';
      tdChange.textContent = 'Change';
      trHeader.appendChild(tdChange);

      const tdMarketCap = document.createElement('td');
      tdMarketCap.className = 'align-right';
      tdMarketCap.textContent = 'Market Cap(Mil.)';
      trHeader.appendChild(tdMarketCap);

      const tdVolume = document.createElement('td');
      tdVolume.className = 'align-right';
      tdVolume.textContent = 'Volume';
      trHeader.appendChild(tdVolume);

      trBody.innerHTML = `
          <td>
            <a href="https://mavefund.com/company?key=${row.ticker}" target="_blank"
              onmouseover="getGraph(event, '${row.ticker}','${row.company_name}', '${row.last_price}', '${row.change}', '${row.price_date}', 1000)"
              onmouseout="removeGraph()">${row.ticker}</a>
          </td>
          <td class="align-right">${row.last_price}</td>
          <td class="align-right ${row.color}">${row.change}%</td>
          <td class="align-right">${row.market_cap}</td>
          <td class="align-right">${row.volume}</td>
        `;

      thead.appendChild(trHeader);
      tbody.appendChild(trBody);
      table.appendChild(thead);
      table.appendChild(tbody);
      gainerContainer.appendChild(table);

      const newsCardWrapper = document.createElement('div');
      newsCardWrapper.className = 'news-card-wrapper';
      newsCardWrapper.style.maxWidth = '725px';
      newsCardWrapper.innerHTML = `
          <div class="news-card1">
            <div class="left-section">
              <div class="news-source-dynamic">
                <img src="${row.company_logo}" alt="">
              </div>
              <div class="news-title-dynamic">
                <a href="${row.news_link}" target="_blank">${row.title}</a>
              </div>
              <div class="news-date-dynamic">${row.date}</div>
            </div>
            <div class="right-section">
              <img src="${row.img}" alt="News Image">
            </div>
          </div>
        `;

      gainerContainer.appendChild(newsCardWrapper);
      slide.appendChild(gainerContainer);
    });

    container.appendChild(slide);
  });


  // Generate slide indicators
  const indicatorContainer = document.createElement('div');
  indicatorContainer.className = 'top-gainer-loser-indicator-container';

  // Append the indicator container to the main container
  container.appendChild(indicatorContainer);

  // Generate slide indicators
  indicatorContainer.innerHTML = ''; // Clear previous indicators
  topGainerLoserData.forEach((mainRow, index) => {
    const indicator = document.createElement('span');
    indicator.className = 'top-gainer-loser-slide-indicator';
    indicator.onclick = () => gainer_currentSlide(index + 1);
    indicatorContainer.appendChild(indicator);
  });



  var gainerloser_index = 0;
  topgainerloser_carousel();

  function topgainerloser_carousel() {
    var i;
    var gainser_slidex = document.getElementsByClassName("topgainerloser-mySlides");
    let gainerloser_indicators = document.getElementsByClassName("top-gainer-loser-slide-indicator");

    for (i = 0; i < gainser_slidex.length; i++) {
      gainser_slidex[i].style.display = "none";
      gainerloser_indicators[i].className = gainerloser_indicators[i].className.replace(" indicator-active", "");
    }
    gainerloser_index++;
    if (gainerloser_index > gainser_slidex.length) { gainerloser_index = 1 }
    gainser_slidex[gainerloser_index - 1].style.display = "flex";
    gainerloser_indicators[gainerloser_index - 1].className += " indicator-active";

    // gainer_showSlides(myIndex)
    topgainer_setTimeout = setTimeout(topgainerloser_carousel, 10000); // Change image every 2 seconds
  }

  
  const topgainerloser_parrent_div = document.querySelector(".topgainerloser-indicator-container-arrow")
  const topgainerloser_arrowElementRight = topgainerloser_parrent_div.querySelector('.go-right');
  const topgainerloser_arrowElementLeft = topgainerloser_parrent_div.querySelector('.go-left');

    topgainerloser_arrowElementRight.addEventListener('click', function() {
      gainerloser_index++;
        if (gainerloser_index > document.getElementsByClassName("topgainerloser-mySlides").length) {
          gainerloser_index = 1;
        }
        gainer_currentSlide(gainerloser_index);
    });

    topgainerloser_arrowElementLeft.addEventListener('click', function() {
        gainerloser_index--;
        if (gainerloser_index < 1) {
          gainerloser_index = document.getElementsByClassName("topgainerloser-mySlides").length;
        }
        gainer_currentSlide(gainerloser_index);
    });


  function topgainer_pauseCarousel() {
    clearTimeout(topgainer_setTimeout);
  }

  function topgainer_resumeCarousel() {
    topgainer_setTimeout = setTimeout(topgainerloser_carousel, 10000);
  }
}


// Function to make API request for homepage news
function fetchHomepageNews() {
  
  fetch('https://mavefund.com/api/v1/market/get_homepage_news')
    .then(response => response.json())
    .then(data => {
      // Call function to generate HTML based on news data
      generateHomepageNewsHTML(data);
    })
    .catch(error => console.error('Error fetching homepage news:', error));
}

// Function to generate HTML for homepage news
function generateHomepageNewsHTML(newsData) {
  const newsContainer = document.querySelector('.homepagenews');
  newsContainer.onmouseover = headline_pauseCarousel;
  newsContainer.onmouseout = headline_resumeCarousel;
  // newsContainer.innerHTML = ''; // Clear previous content

  newsData.forEach((newsItem, index) => {
    const newsCard = document.createElement('div');
    newsCard.className = `news-card mySlides ${newsItem.class}`;
    newsCard.innerHTML = `
        <div class="left-section">
          <div class="news-source-dynamic">
            <img src="${newsItem.company_logo}" alt="">
          </div>
          <div class="news-title-dynamic">
            <a href="${newsItem.link}">${newsItem.title}</a>
          </div>
          <div class="news-date-dynamic">${newsItem.news_date}</div>
        </div>
        <div class="right-section">
          <img src="${newsItem.img}" alt="News Image">
        </div>
      `;
    newsContainer.appendChild(newsCard);
  });



  var myIndex = 0;
  carousel();

  function carousel() {
    var i;
    var slides = document.getElementsByClassName("mySlides");
    for (i = 0; i < slides.length; i++) {
      slides[i].style.display = "none";
    }
    myIndex++;
    if (myIndex > slides.length) { myIndex = 1 }
    slides[myIndex - 1].style.display = "flex";
    currentSlide(myIndex)
    headline_setTimeout = setTimeout(carousel, 10000); // Change image every 2 seconds
  }

  function headline_pauseCarousel() {
    clearTimeout(headline_setTimeout);
  }

  function headline_resumeCarousel() {
    headline_setTimeout = setTimeout(carousel, 10000);
  }


  const news_parrent_div = document.querySelector(".news-indicator-container-arrow")
  const news_arrowElementRight = news_parrent_div.querySelector('.go-right');
  const news_arrowElementLeft = news_parrent_div.querySelector('.go-left');

    news_arrowElementRight.addEventListener('click', function() {
      slideIndex++;
        if (slideIndex > document.getElementsByClassName("news-card").length) {
          slideIndex = 1;
        }
        currentSlide(slideIndex);
    });

    news_arrowElementLeft.addEventListener('click', function() {
        slideIndex--;
        if (slideIndex < 1) {
          slideIndex = document.getElementsByClassName("news-card").length;
        }
        currentSlide(slideIndex);
    });


}

// Function to make API request for macroeconomics data
function fetchMacroData() {
  fetch('https://mavefund.com/api/v1/market/get_homepage_macro')
    .then(response => response.json())
    .then(data => {
      // Call function to generate HTML based on macroeconomics data
      generateMacroHTML(data);
    })
    .catch(error => console.error('Error fetching macroeconomics data:', error));
}

// Function to generate HTML for macroeconomics data
function generateMacroHTML(macroData) {
  const macroContainer = document.querySelector('.macroeconomics-home');
  macroContainer.innerHTML = ''; // Clear previous content

  macroData.forEach(row => {
    const macroRow = document.createElement('tr');
    const growthClass = row.growth < 0 ? 'red' : 'green';

    macroRow.innerHTML = `
      <td><a onmouseover="getChart(event, '${row.lower}', '${row.indices}', 1000)"
        onmouseleave="removeChart('${row.lower}')" target="_blank" href="${row.link}">${row.indices}</a></td>
      <td class="align-right">${row.last_price}</td>
      <td class="align-right ${growthClass}">${row.growth}%</td>
      <td class="align-right">${row.date}</td>
      <td class="align-right">${row.country}</td>
    `;
    macroContainer.appendChild(macroRow);
  });
}

document.addEventListener('DOMContentLoaded', function () {
  setDisplay('.news-loading-container', 'flex')
  setDisplay('.weeklyoutlook-loading-container', 'flex')
  setDisplay('.topgainerloser-loading-container', 'flex')

  // Call fetchWeeklyOutlook function to fetch and display data after page load
  fetchHomepageNews();
  fetchWeeklyOutlook();
  fetchTopGainerLoser();
  fetchMacroData();

// Define a function to run repeatedly after a delay
function runRepeatedlyWithDelay() {
  // Run the setDisplay function for each selector every 2000 milliseconds (2 seconds)
  setInterval(function() {
    setDisplay('.news-loading-container', 'none');
    setDisplay('.weeklyoutlook-loading-container', 'none');
    setDisplay('.topgainerloser-loading-container', 'none');
  }, 5000); // 2000 milliseconds = 2 seconds
}

// Call the function to run repeatedly after a delay
runRepeatedlyWithDelay();


});