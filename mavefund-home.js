const initiateRollingCompanyLogos = () => {
    var copy = document.querySelector(".logos-slide").cloneNode(true);
    document.querySelector(".logo-slider").appendChild(copy);
}

const initiateInvestmentCalculator = () => {
    var rangeSlider = function () {
        var slider = $('.range-slider'),
            range = $('.range-slider__range'),
            value = $('.range-slider__value');

        slider.each(function () {

            value.each(function () {
                var value = $(this).prev().attr('value');
                $(this).html(value);
            });

            range.on('input', function () {
                $(this).next(value).html(this.value);
            });
        });
    };
    rangeSlider();

    setTimeout(() => {
        calculateCompoundInterest()
    }, 1000)
}

const handleNavigationDropdownClick = () => {
    $("#NavServicesTrigger").click(function () {
        $('#NavServicesDropdown').toggleClass('show')
    });
    $('.navbar-toggle').on('click', function () {
        $('.navbar-collapse').toggleClass('show');
    });
}

const initiateBlogsSlider = () => {
    $('.blogs').slick({
        centerMode: true,
        centerPadding: '0px',
        slidesToShow: 3,
        arrows: false,
        prevArrow: $('#blogs-previous'),
        nextArrow: $('#blogs-next'),
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 1
                }
            },
            {
                breakpoint: 480,
                settings: {
                    arrows: false,
                    centerMode: true,
                    centerPadding: '40px',
                    slidesToShow: 1
                }
            }
        ]
    });
    $('#blogs-previous').click(function () {
        $('.blogs').slick('slickPrev');
    })
    $('#blogs-next').click(function () {
        $('.blogs').slick('slickNext');
    })
}

const initiateBlogs = async () => {
    let blogs;
    try {
        const blogResponse = await fetch('https://mavefund.com/api/v1/market/get_latest_blog')
        const {data} = await blogResponse.json()
        blogs = data
    } catch (err) {
        blogs = [
            {
                "title": "Weekly US Stock Market Update (Jul. 29th - Aug. 2nd)",
                "redirect_link": "http://mavefund.com/weekly-us-stock-market-update",
                "paragraph": "Discover the top gainers and losers in the US stock market for the week of Jul. 29th - Aug. 2nd. Highlights include 2U Inc. surging 99% and Intel plummeting 32%. Stay updated with the latest trends!",
                "image_link": "http://mavefund.com/images/stock-market-update.jpg"
            },
            {
                "title": "#StockMarket Wrap-Up Today: July 31, 2024",
                "redirect_link": "http://mavefund.com/stock-market-wrap-up-july-31-2024",
                "paragraph": "Get the latest stock market updates for July 31, 2024: Powell hints at potential rate cuts, Meta's advertising growth boosts sales, and top gainers and losers.",
                "image_link": "http://mavefund.com/images/stock-market-wrap-up.jpg"
            },
            {
                "title": "Weekly Commodities Update (July 22-28)",
                "redirect_link": "http://mavefund.com/weekly-commodities-update-july-22-28",
                "paragraph": "Stay updated with the latest market trends in commodities for the week of July 22-28, 2024. Discover the performance of Corn, Live Cattle, Lean Hogs, Coffee, Wheat, Soybean Oil, Natural Gas, Crude Oil, Brent Crude, and Gold.",
                "image_link": "http://mavefund.com/images/commodities-update.jpg"
            }
        ]
    }
    
    const blogsContainer = document.querySelector('.blogs');
    const blogLoaders = document.querySelectorAll('.blog-loader')
    blogs.forEach(item => {
        const colItem = document.createElement('div');
        colItem.className = "col-md-4";

        const blogItem = document.createElement('a');
        blogItem.href = item.redirect_link;
        blogItem.target = "_blank";
        blogItem.className = "blog";

        const img = document.createElement('img');
        img.src = item.image_link;
        img.alt = item.title;
        img.className = "feature-image";

        const badge = document.createElement('span');
        badge.className = "badge badge-primary";
        badge.textContent = "Primary";

        const title = document.createElement('h4');
        title.className = "title";
        title.textContent = item.title;

        const paragraph = document.createElement('p');
        paragraph.className = "gray";
        paragraph.textContent = item.paragraph;

        blogItem.appendChild(img);
        blogItem.appendChild(badge);
        blogItem.appendChild(title);
        blogItem.appendChild(paragraph);
        colItem.appendChild(blogItem)

        blogLoaders.forEach(loader => {
            loader.remove()
        });        

        blogsContainer.appendChild(colItem);
    });
    initiateBlogsSlider()
}

const initiateFeaturesSlider = () => {
    $('#FeatureSlider').slick({
        centerMode: false,
        centerPadding: '0px',
        slidesToShow: 3,
        arrows: false,
        infinite: true,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    arrows: false,
                    centerMode: false,
                    centerPadding: '40px',
                    slidesToShow: 1,
                    infinite: true

                }
            },
            {
                breakpoint: 480,
                settings: {
                    arrows: false,
                    centerMode: false,
                    centerPadding: '40px',
                    infinite: true,
                    slidesToShow: 1
                }
            }
        ]
    });
}

const initiateOverviewSlider = () => {
    $('#OverviewSlider').slick({
        centerMode: false,
        centerPadding: '0px',
        slidesToShow: 3,
        arrows: false,
        infinite: true,
        responsive: [
            {
                breakpoint: 768,
                settings: {
                    arrows: false,
                    centerMode: false,
                    centerPadding: '40px',
                    slidesToShow: 1,
                    infinite: true

                }
            },
            {
                breakpoint: 480,
                settings: {
                    arrows: false,
                    centerMode: false,
                    centerPadding: '40px',
                    infinite: true,
                    slidesToShow: 1
                }
            }
        ]
    });
}

document.addEventListener("DOMContentLoaded", (event) => {
    initiateRollingCompanyLogos()
    initiateInvestmentCalculator()
    initiateFeaturesSlider()
    initiateOverviewSlider()
    handleNavigationDropdownClick()
    initiateBlogs()
});
