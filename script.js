let map, marker;

const options = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 0,
};

function getCurrentPositionAsync(options) {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
}

async function onMapClick(e) {
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;

    if (marker) {
        marker.setLatLng([lat, lng]);
    } else {
        marker = L.marker([lat, lng]).addTo(map);
    }

    const cityResponse = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=pt`
    );
    const cityJson = await cityResponse.json();
    const city = `${cityJson.city || "Localidade desconhecida"}, ${
        cityJson.principalSubdivision
    } - ${cityJson.countryName}`;

    // Conteúdo do Popup
    const popupContent = `
                <p>Verificar o ar de <strong>${city}</strong>?</p>
                <button id="verify-button" class="popup-button">Verificar qualidade do ar</button>
            `;

    marker.bindPopup(popupContent).openPopup();

    // Adicionamos o listener diretamente no botão dentro do popup
    // Isso é mais robusto pois o popup é recriado a cada clique
    document.getElementById("verify-button").addEventListener("click", () => {
        const locationData = {
            coords: {
                lat: lat,
                lng: lng,
            },
            location: {
                city: cityJson.city || "Localidade desconhecida",
                state: cityJson.principalSubdivision,
                country: cityJson.countryName,
            },
        };

        // ATENÇÃO: Verifique o nome da chave que sua outra página espera.
        // No seu script anterior era 'locationData', então mantive.
        localStorage.setItem("locationData", JSON.stringify(locationData));

        // Navega para a página de detalhes
        window.location.href = "/details-page/details.html"; // Ajuste o caminho se necessário
    });
}

async function initialize() {
    let crd;
    try {
        const pos = await getCurrentPositionAsync(options);
        crd = pos.coords;
    } catch (err) {
        console.warn(`ERROR(${err.code}): ${err.message}`);
        crd = { latitude: -23.4435, longitude: -51.9353 }; // Coordenadas de Maringá/Sarandi
    } finally {
        map = L.map("map").setView([crd.latitude, crd.longitude], 13);
        L.tileLayer(
            "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
            {
                attribution:
                    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
                maxZoom: 19,
            }
        ).addTo(map);

        // O seu script já manipula o loader, então esta linha é crucial
        document.querySelector(".loader").style.display = "none";

        map.on("click", onMapClick);
    }
}

addEventListener("DOMContentLoaded", initialize);
