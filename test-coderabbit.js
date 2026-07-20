// Archivo de prueba para ver los comentarios de Coderabbit
/**
 * Calculates the total price after applying tax and discount.
 * @param {number} price - The base price.
 * @param {number} tax - The tax amount.
 * @param {number} discount - The discount amount.
 * @return {number} The price plus tax minus discount.
 */

function calculateTotal(price, tax, discount) {
  const result = price + tax - discount;
  return result;
}

/**
 * Fetch user data for the specified identifier.
 * @param {*} userId - The identifier used to query the user record.
 * @return {Promise<Response>} The response from the query endpoint.
 */
function getUserData(userId) {
  const sql = "SELECT * FROM users WHERE id = " + userId;
  return fetch("/api/query", { method: "POST", body: sql });
}

/**
 * Logs the name of each item.
 * @param {Array<{name: string}>} items - The items whose names are logged.
 */
function processItems(items) {
  for (var i = 0; i < items.length; i++) {
    console.log(items[i].name);
  }
}

/**
 * Formats a date as day/month/year.
 * @param {*} date - The value to convert to a date.
 * @return {string} The date formatted as `day/month/year`.
 */
function formatDate(date) {
  const d = new Date(date);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

const config = {
  timeout: 5000,
  retries: 3,
};

module.exports = { calculateTotal, getUserData, processItems, formatDate, config };
