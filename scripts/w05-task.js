/* W05: Programming Tasks */

/* Declare and initialize global variables */
const templesElement = document.getElementById('temples');
let templeList = [];

/* async displayTemples Function */
const displayTemples = temples => {
    temples.forEach(temple => {
        const article = document.createElement('article');
        const h3 = document.createElement('h3');
        const img = document.createElement('img');

        h3.textContent = temple.templeName;
        img.src = temple.imageUrl;
        img.alt = temple.location;

        article.appendChild(h3);
        article.appendChild(img);

        templesElement.appendChild(article);
    });
};

/* async getTemples Function using fetch()*/
const getTemples = async () => {
    try {
        const response = await fetch("https://byui-cse.github.io/cse121b-ww-course/resources/temples.json");
        templeList = await response.json();
        templeList.sort((a, b) => a.templeName.localeCompare(b.templeName)); 
        displayTemples(templeList);
    } catch (error) {
        console.error('Error fetching temple data:', error);
    }
};

/* reset Function */
const reset = () => {
    templesElement.innerHTML = ''; 
};

/* filterTemples Function */
const filterTemples = temples => {
    reset(); 
    const filter = document.getElementById('filtered').value;

    switch (filter) {
        case 'utah':
            displayTemples(temples.filter(temple => temple.location.includes('Utah')));
            break;
        case 'notutah':
            displayTemples(temples.filter(temple => !temple.location.includes('Utah')));
            break;
        case 'older':
            const olderTemples = temples.filter(temple => new Date(temple.dedicated) < new Date(1950, 0, 1));
            displayTemples(olderTemples);
            break;
        case 'all':
        default:
            displayTemples(temples);
            break;
    }
};

/* Center the filter above the images */
const filterContainer = document.createElement('div');
filterContainer.style.textAlign = 'center';

const filterSelect = document.getElementById('filtered');
filterContainer.appendChild(filterSelect);

document.getElementById('gridly').insertBefore(filterContainer, templesElement);

/* Event Listener */
document.getElementById('filtered').addEventListener('change', () => {
    filterTemples(templeList);
});

getTemples();