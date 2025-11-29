
    // Inicializar mapa
    const map = L.map('map').setView([-16.5, -68.2], 6);

    // Capa base
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 18,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Tu API Key
    const apiKey = 'b74b580f8dbf795515d05173f5216bcd'; // ← Cambia esto por tu clave de OpenWeatherMap
    const infoBox = document.getElementById('weatherInfo');

    // Capas meteorológicas
    const capas = {
      nubes: L.tileLayer(`https://tile.openweathermap.org/map/clouds_new/{z}/{x}/{y}.png?appid=${apiKey}`, { opacity: 0.6 }),
      temp: L.tileLayer(`https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`, { opacity: 0.6 }),
      viento: L.tileLayer(`https://tile.openweathermap.org/map/wind_new/{z}/{x}/{y}.png?appid=${apiKey}`, { opacity: 0.6 }),
      lluvia: L.tileLayer(`https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`, { opacity: 0.6 })
    };

    // Función para alternar capas
    function toggleLayer(layerKey, buttonId) {
      const btn = document.getElementById(buttonId);

      if (map.hasLayer(capas[layerKey])) {
        map.removeLayer(capas[layerKey]);
        btn.classList.remove("active");
      } else {
        map.addLayer(capas[layerKey]);
        btn.classList.add("active");
      }
    }

    // Asignar eventos a los botones
    document.getElementById('btnNubes').onclick = () => toggleLayer('nubes', 'btnNubes');
    document.getElementById('btnTemp').onclick = () => toggleLayer('temp', 'btnTemp');
    document.getElementById('btnViento').onclick = () => toggleLayer('viento', 'btnViento');
    document.getElementById('btnLluvia').onclick = () => toggleLayer('lluvia', 'btnLluvia');

    // Variable para marcador activo
    let marker;

    // Evento clic en mapa → mostrar datos del clima
    map.on('click', async function(e) {
      const { lat, lng } = e.latlng;

      if (marker) map.removeLayer(marker);
      marker = L.marker([lat, lng]).addTo(map);

      const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lng}&units=metric&lang=es&appid=${apiKey}`;

      try {
        const response = await fetch(url);
        const data = await response.json();

        const content = `
          <b>${data.name || 'Ubicación sin nombre'}</b><br>
          🌡️ Temp: ${data.main.temp} °C<br>
          💧 Humedad: ${data.main.humidity}%<br>
          🌬️ Viento: ${data.wind.speed} m/s<br>
          ☁️ Cielo: ${data.weather[0].description}
        `;

        marker.bindPopup(content).openPopup();
        infoBox.innerHTML = content;
      } catch (error) {
        infoBox.textContent = 'Error al obtener datos meteorológicos.';
      }
    });