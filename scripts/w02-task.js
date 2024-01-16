/* W02-Task - Profile Home Page */

/* Step 1 - Setup type tasks - no code required */

/* Step 2 - Variables */
const fullName = "Monday Ogedengbe";
const currentYear = new Date().getFullYear();
const profilePicture = 'images/IMG_9021(2).JPG';

/* Step 3 - Element Variables */
const nameElement = document.getElementById('name');
const foodElement = document.getElementById('food');
const yearElement = document.querySelector('#year');
const imageElement = document.querySelector('main picture img');

/* Step 4 - Adding Content */
nameElement.innerHTML = `<strong>${fullName}</strong>`;
yearElement.textContent = currentYear;
imageElement.setAttribute('src', profilePicture);
imageElement.setAttribute('alt', `Profile image of ${fullName}`);

/* Step 5 - Array */
let favoriteFoods = [
  "Pounded yam",
  "Semo",
  "Rice and Beans",
  "Plantain",
  "Efo riro with Igbin",
  "Egusi soup with goat meat",
];

const newFavoriteFood = "Jollof rice and chicken";

// my original set of favorite foods
foodElement.innerHTML += '<h3>My set of favorite foods:</h3>';
foodElement.innerHTML += favoriteFoods.map(food => `<p>${food}</p>`).join('');

// space
foodElement.innerHTML += '<br><br>';

// Add a new favorite food 
favoriteFoods.push("Jollof rice and chicken");

// Display the set after adding a new element
foodElement.innerHTML += '<h3>My set of favorite foods after adding another food</h3>';
foodElement.innerHTML += favoriteFoods.map(food => `<p>${food}</p>`).join('');

// space
foodElement.innerHTML += '<br><br>';

// remove first food
favoriteFoods.shift();

// the set after the first food has been removed
foodElement.innerHTML += '<h3>My set of favorite foods after removing first food:</h3>';
foodElement.innerHTML += favoriteFoods.map(food => `<p>${food}</p>`).join('');

// space 
foodElement.innerHTML += '<br><br>';

// Remove the last food 
favoriteFoods.pop();

// the set after the first last has been removed
foodElement.innerHTML += '<h3>My set of favorite foods after removing last food:</h3>';
foodElement.innerHTML += favoriteFoods.map(food => `<p>${food}</p>`).join('');
