function getRiskProfile(pollutantId, value) {
    const thresholds = {
        co: [4400, 9400, 12400],
        nh3: [200, 400, 1000],
        no: [60, 100, 200],
        no2: [40, 70, 150],
        o3: [54, 70, 105],
        pm2_5: [15, 30, 55],
        pm10: [20, 50, 100],
        so2: [20, 40, 75],
    };
    const limits = thresholds[pollutantId];
    if (!limits) return { color: "var(--risk-good)", percentage: 10 };

    if (value < limits[0]) {
        return {
            color: "var(--risk-good)",
            percentage: Math.min(25, (value / limits[0]) * 25),
        };
    } else if (value < limits[1]) {
        return {
            color: "var(--risk-moderate)",
            percentage: 25 + (value / limits[1]) * 25,
        };
    } else if (value < limits[2]) {
        return {
            color: "var(--risk-unhealthy)",
            percentage: 50 + (value / limits[2]) * 25,
        };
    } else {
        return {
            color: "var(--risk-very-unhealthy)",
            percentage: Math.min(100, 75 + (value / (limits[2] * 1.5)) * 25),
        };
    }
}

async function loadAirQualityData() {
    const grid = document.getElementById("pollutants-grid");
    const loader = document.getElementById("loader");

    grid.style.opacity = "0.5";
    loader.textContent = "Buscando dados...";

    const locationDataString = localStorage.getItem("locationData");

    if (!locationDataString) {
        console.error("Dados de localização não encontrados no localStorage.");
        document.body.innerHTML =
            "<h1>Erro: Dados de localização não encontrados. Por favor, volte ao mapa e selecione um local.</h1>";
        return;
    }

    const locationData = JSON.parse(locationDataString);

    if (!locationData.coords || !locationData.location) {
        console.error("O formato dos dados no localStorage é inválido.");
        document.body.innerHTML =
            "<h1>Erro: Formato de dados inválido. Por favor, selecione um local no mapa novamente.</h1>";
        return;
    }

    const { lat, lng } = locationData.coords;
    const { city, state } = locationData.location;

    const locationNameElement = document.getElementById("location-name");
    locationNameElement.textContent = `${city}, ${state}`;

    const apiKey = "53d067b292d85dfd75c5b0604139fc74"; // Não há um backend, portanto a chave de API está no lado do cliente, apesar de ser uma má prática
    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lng}&appid=${apiKey}&units=metric`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(
                `A requisição da API falhou com status ${response.status}`
            );
        }
        const airDataObject = await response.json();
        const airDataGases = airDataObject.list[0].components;

        for (const [key, value] of Object.entries(airDataGases)) {
            const bodyElement = document.getElementById(`${key}-body`);
            const riskBarElement = document.getElementById(`${key}-risk-bar`);

            if (bodyElement && riskBarElement) {
                const [integerPart, decimalPart] = value.toFixed(2).split(".");
                bodyElement.innerHTML = `
                    <span class="value">${integerPart}</span><span class="value" style="color: var(--color-subtle);">.${decimalPart}</span>
                    <span class="unit">µg/m³</span>
                `;

                const risk = getRiskProfile(key, value);
                riskBarElement.style.width = `${risk.percentage}%`;
                riskBarElement.style.backgroundColor = risk.color;
            }
        }
    } catch (error) {
        console.error(
            "Falha ao buscar ou processar os dados da qualidade do ar:",
            error
        );
        loader.textContent =
            "Erro ao carregar os dados da qualidade do ar. Tente novamente.";
    } finally {
        grid.style.opacity = "1";
        if (loader.textContent === "Buscando dados...") {
            loader.style.display = "none";
        }
    }
}

addEventListener("DOMContentLoaded", loadAirQualityData);
