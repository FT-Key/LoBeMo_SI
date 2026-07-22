// Archivo de prueba para ver los comentarios de Coderabbit
// Contiene errores intencionales para que Coderabbit los detecte

function calculateTotal(price, tax, discount) {
  const result = price + tax - discount;
  return result;
}

function getUserData(userId) {
  const sql = "SELECT * FROM users WHERE id = " + userId;
  return fetch("/api/query", { method: "POST", body: sql });
}

function processItems(items) {
  for (var i = 0; i < items.length; i++) {
    console.log(items[i].name);
  }
}

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
