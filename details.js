const airData = localStorage.getItem("airData");

const airDataObject = JSON.parse(airData);
const airDataGases = airDataObject.list[0].components;

for (const [key, value] of Object.entries(airDataGases)) {
    const gasValue = document.getElementById(`${key}-value`);
    gasValue.textContent = `${value} μg/m³`;
}
