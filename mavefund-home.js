document.addEventListener("DOMContentLoaded", (event) => {

    $("#NavServicesTrigger").click(function(){
        $('#NavServicesDropdown').toggleClass('show')
    });

    // CALCULATOR
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
    $('#blogs-previous').click(function(){
        $('.blogs').slick('slickPrev');
    })
    $('#blogs-next').click(function(){
        $('.blogs').slick('slickNext');
    })


    setTimeout(() => {
        calculateCompoundInterest()
    })
});
