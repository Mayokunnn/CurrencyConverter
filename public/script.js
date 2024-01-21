document.addEventListener("DOMContentLoaded", async () => {
  // Fetch currencies and populate dropdowns
  const currencies = await fetchCurrencies();
  populateDropdown("fromCurrency", currencies);
  populateDropdown("toCurrency", currencies);
});

async function fetchCurrencies() {
  const response = await fetch(
    "https://api.exchangerate-api.com/v4/latest/USD"
  );
  const data = await response.json();
  return Object.keys(data.rates);
}

function populateDropdown(id, currencies) {
  const dropdown = document.getElementById(id);
  currencies.forEach((currency) => {
    const option = document.createElement("option");
    option.text = currency;
    option.value = currency;
    dropdown.add(option);
  });
}

async function convertCurrency() {
  const fromCurrency = document.getElementById("fromCurrency").value;
  const toCurrency = document.getElementById("toCurrency").value;
  const amount = document.getElementById("amount").value;

  if (!fromCurrency || !toCurrency || !amount) {
    alert("Please fill in all fields.");
    return;
  }

  const response = await fetch(
    `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
  );
  const data = await response.json();
  const exchangeRate = data.rates[toCurrency];
  const result = (amount * exchangeRate).toFixed(2);

  document.getElementById(
    "result"
  ).innerText = `${amount} ${fromCurrency} = ${result} ${toCurrency}`;

  document.getElementById("amount").value = "";
  // Save conversion history
  saveConversionHistory({ amount, fromCurrency, toCurrency, result });
  updateHistoryList();
}

// function saveConversionHistory(entry) {
//     const history = JSON.parse(localStorage.getItem('history')) || [];
//     history.push(entry);
//     localStorage.setItem('history', JSON.stringify(history));
// }

// function updateHistoryList() {
//     const historyList = document.getElementById('history');
//     historyList.innerHTML = '';

//     const history = JSON.parse(localStorage.getItem('history')) || [];
//     history.forEach(entry => {
//         const listItem = document.createElement('li');
//         listItem.innerText = entry;
//         historyList.appendChild(listItem);
//     });
// }

// Function to save conversion history to the server
async function saveConversionHistory(entry) {
  try {
    const response = await fetch("/convert", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });

    if (response.status === 201) {
      console.log("Conversion saved successfully");
      // Optionally, you can do something on successful save
    } else {
      console.error("Failed to save conversion:", response.statusText);
      // Handle the error accordingly
    }
  } catch (error) {
    console.error("Error saving conversion:", error);
    // Handle network or other errors
  }
}

// Function to fetch and update conversion history from the server
async function updateHistoryList() {
  const historyList = document.getElementById("history");
  historyList.innerHTML = `<div class="loader"></div>`;

  try {
    const response = await fetch("/history");
    const history = await response.json();
    historyList.innerHTML = "";

    if (history.length === 0) {
      const message = document.createElement("p");
      message.innerText = "No conversion history yet.";
      historyList.appendChild(message);
      return;
    }

    history.forEach((entry) => {
      const listItem = document.createElement("li");
      listItem.innerText = `${entry.amount} ${entry.fromCurrency} to ${entry.result} ${entry.toCurrency}`;
      historyList.appendChild(listItem);
    });
  } catch (error) {
    console.error("Error fetching conversion history:", error);
    // Handle network or other errors
  }
}

// Example of how to use the functions

// Update history list from the server
updateHistoryList();
