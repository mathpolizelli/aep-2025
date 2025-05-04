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

	const apiKey = "53d067b292d85dfd75c5b0604139fc74";
	const url = `http://api.openweathermap.org/data/2.5/air_pollution?lat=${e.latlng.lat}&lon=${e.latlng.lng}&appid=${apiKey}`;
	console.log(e.latlng.lat);
	console.log(e.latlng.lng);

	if (marker) {
		marker.setLatLng([lat, lng]);
	} else {
		marker = L.marker([lat, lng]).addTo(map);
	}

	const cityResponse = await fetch(
		`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=pt`
	);
	const cityJson = await cityResponse.json();
	const city = `${cityJson.city}, ${cityJson.principalSubdivision} - ${cityJson.countryName}`;
	console.log(cityJson);

	const popup = `
        <p>Verificar o ar de ${city}?</p>
        <a href="/details-page/details.html"><button class="popup-button">Verificar qualidade do ar</button></a>
    `;

	marker.bindPopup(popup).openPopup();

	const verify = document.querySelector(".popup-button");

	verify.addEventListener("click", async () => {
		// const response = await fetch(url);
		// const json = await response.json();
		// console.log(json);
		// localStorage.setItem("airData", JSON.stringify(json));
		// window.location.href = "/details-page/details.html";
	});
}

async function initialize() {
	let crd;
	try {
		const pos = await getCurrentPositionAsync(options);
		crd = pos.coords;

		console.log("Your current position is:");
		console.log(`Latitude : ${crd.latitude}`);
		console.log(`Longitude: ${crd.longitude}`);
		console.log(`More or less ${crd.accuracy} meters.`);
	} catch (err) {
		console.warn(`ERROR(${err.code}): ${err.message}`);
		crd = { latitude: -23.3105, longitude: -51.3695 };
	} finally {
		map = L.map("map").setView([crd.latitude, crd.longitude], 13);

		L.tileLayer(
			"https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
			{
				maxZoom: 19,
			}
		).addTo(map);

		document.querySelector(".loader").style.display = "none";

		map.on("click", onMapClick);
	}
}

addEventListener("DOMContentLoaded", () => {
	initialize();
	console.log("Initialization started");
});
