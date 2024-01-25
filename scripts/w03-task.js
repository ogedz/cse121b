/* LESSON 3 - Programming Tasks */

/* FUNCTIONS */

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/* Function Definition - Add Numbers */

function add(number1, number2) {
    return number1 + number2;
}
  
// Add Numbers from HTML Form
function addNumbers() {
    const add1 = parseFloat(document.getElementById('add1').value);
    const add2 = parseFloat(document.getElementById('add2').value);
    const sum = add(add1, add2);
    document.getElementById('sum').value = sum.toFixed(2);
}
  
// Include Event Listener in Button
document.getElementById('addNumbers').addEventListener('click', addNumbers);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* Function Expression - Subtract Numbers */

const subtract = function(number1, number2) {
    return number1 - number2;
};
  
// Subtract Numbers from HTML Form
const subtractNumbers = function() {
    const subtract1 = parseFloat(document.getElementById('subtract1').value);
    const subtract2 = parseFloat(document.getElementById('subtract2').value);
    const difference = subtract(subtract1, subtract2);
    document.getElementById('difference').value = difference.toFixed(2);
};
  
// Include Event Listener in Button
document.getElementById('subtractNumbers').addEventListener('click', subtractNumbers);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  

/* Arrow Function - Multiply Numbers */

const multiply = (number1, number2) => number1 * number2;

// Multiply Numbers from HTML Form
const multiplyNumbers = () => {
  const factor1 = parseFloat(document.getElementById('factor1').value);
  const factor2 = parseFloat(document.getElementById('factor2').value);
  const product = multiply(factor1, factor2);
  document.getElementById('product').value = product.toFixed(2);
};

// Include Event Listener in Button
document.getElementById('multiplyNumbers').addEventListener('click', multiplyNumbers);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* Open Function Use - Divide Numbers */

function divide(number1, number2) {
    return number1 / number2;
}
  
// Divide Numbers from HTML Form
function divideNumbers() {
    const dividend = parseFloat(document.getElementById('dividend').value);
    const divisor = parseFloat(document.getElementById('divisor').value);
    const quotient = divide(dividend, divisor);
    document.getElementById('quotient').value = quotient.toFixed(2);
}
  
// Include Event Listener in Button
document.getElementById('divideNumbers').addEventListener('click', divideNumbers);

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////  
  
/* Decision Structure */

// Event Listener for Total Due Button
document.getElementById('getTotal').addEventListener('click', function() {
    // Declare and instantiate a variable that stores the numeric value entered by the user in the subtotal field
    const subtotalInput = document.getElementById('subtotal');
    const subtotal = parseFloat(subtotalInput.value);
  
    // User input validation
    if (isNaN(subtotal)) {
      alert("Please enter a valid numeric amount for the subtotal.");
      return;
    }
  
    // Check IF the membership checkbox has been checked by the user 
    const membershipCheckbox = document.getElementById('membershipCheckbox');
    const applyDiscount = membershipCheckbox.checked;
  
    // Apply 20% Discount if Membership Checkbox is Checked
    const discountMultiplier = applyDiscount ? 0.8 : 1;
  
    // Calculate Total
    const total = subtotal * discountMultiplier;
  
    // Total due
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
});
  
  
  
    
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/* ARRAY METHODS - Functional Programming */

/* Output Source Array */
const numbersArray = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
document.getElementById('array').textContent = numbersArray.toString();

/* Output Odds Only Array */
const oddNumbers = numbersArray.filter(number => number % 2 === 1);
document.getElementById('odds').textContent = oddNumbers.toString();

/* Output Evens Only Array */
const evenNumbers = numbersArray.filter(number => number % 2 === 0);
document.getElementById('evens').textContent = evenNumbers.toString();

/* Output Sum of Org. Array */
const sumOfArray = numbersArray.reduce((acc, number) => acc + number, 0);
document.getElementById('sumOfArray').textContent = sumOfArray;

/* Output Multiplied by 2 Array */
const multipliedArray = numbersArray.map(number => number * 2);
document.getElementById('multiplied').textContent = multipliedArray.toString();

/* Output Sum of Multiplied by 2 Array */
const sumOfMultiplied = numbersArray.map(number => number * 2).reduce((acc, number) => acc + number, 0);
document.getElementById('sumOfMultiplied').textContent = sumOfMultiplied;

///////////////////////////////////////////////////////////////////////////////////////////////////////////////////




