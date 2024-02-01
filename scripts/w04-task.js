/* LESSON 3 - Programming Tasks */

/* Profile Object  */
let myProfile = {
    name: "Monday Ogedengbe",
    photo: "images/img3.JPG",
    favoriteFoods: ["Pounded Yam", "Semo with Efo riro and Igbin", "Rice and Beans"],
    hobbies: ["Play Chess", "Watch cartoon with kids", "Play Ayo Olopon"],
    placesLived: []
};
  
/* Populate Profile Object with placesLive objects */
myProfile.placesLived.push({
    place: "Ile-Ife",
    length: "5 years"
});

myProfile.placesLived.push(
    { place: "Abuja", length: "9 years" },
    { place: "Ezzangbo", length: "1 year" },
    { place: "Jos", length: "4 years" },
    { place: "Ilorin", length: "2 years" },
    { place: "Ibadan", length: "20 years" }
);

/* DOM Manipulation - Output */

/* Name */
document.getElementById("name").textContent = myProfile.name;

/* Photo with attributes */
let imgElement = document.getElementById("photo");
imgElement.src = myProfile.photo;
imgElement.alt = myProfile.name;

/* Favorite Foods List*/
let favoriteFoodsUl = document.getElementById("favorite-foods");
myProfile.favoriteFoods.forEach(food => {
  let li = document.createElement("li");
  li.textContent = food;
  favoriteFoodsUl.appendChild(li);
});

/* Hobbies List */
let hobbiesUl = document.getElementById("hobbies");
myProfile.hobbies.forEach(hobby => {
  let li = document.createElement("li");
  li.textContent = hobby;
  hobbiesUl.appendChild(li);
});

/* Places Lived DataList */
let placesLivedDl = document.getElementById("places-lived");
myProfile.placesLived.forEach(place => {
  let dt = document.createElement("dt");
  let dd = document.createElement("dd");

  dt.textContent = place.place;
  dd.textContent = place.length;

  placesLivedDl.appendChild(dt);
  placesLivedDl.appendChild(dd);
});

