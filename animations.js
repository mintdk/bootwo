
const logo = document.querySelector(".logo");

if (logo) {

    let position = 0;
    let direction = 1;

    setInterval(() => {

        position += direction * 0.25;

        if (position >= 8) direction = -1;
        if (position <= 0) direction = 1;

        logo.style.transform = `translateY(${-position}px)`;

    }, 20);

}


const cards = document.querySelectorAll(".card");

const observer = new IntersectionObserver((entries)=>{

    entries.forEach(entry=>{

        if(entry.isIntersecting){

            entry.target.animate([

                {
                    opacity:0,
                    transform:"translateY(40px)"
                },

                {
                    opacity:1,
                    transform:"translateY(0)"
                }

            ],{

                duration:600,
                fill:"forwards"

            });

        }

    });

});

cards.forEach(card=>observer.observe(card));
