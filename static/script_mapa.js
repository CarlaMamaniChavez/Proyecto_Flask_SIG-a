const map = L.map('map').setView([-16.5, -68.2], 6);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let marcadorInicio = null;
    let marcadorDestino = null;
    let modo = null;
    let ruta = null;
    const distanciaDiv = document.getElementById('distancia');

  // Obtener ubicación actual del usuario
    if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        marcadorInicio = L.marker([lat, lng], { draggable: true })
            .addTo(map)
            .bindPopup(`📍 Ubicación inicial<br>Lat: ${lat.toFixed(5)}<br>Lng: ${lng.toFixed(5)}`)
            .openPopup();
        map.setView([lat, lng], 14);
        marcadorInicio.on('dragend', calcularRuta);
        },
        (err) => alert("⚠️ No se pudo obtener tu ubicación.")
    );
    }

  // Botones modo inicio/destino
    document.getElementById('btnInicio').addEventListener('click', () => { modo='inicio'; activarBoton('btnInicio'); });
    document.getElementById('btnDestino').addEventListener('click', () => { modo='destino'; activarBoton('btnDestino'); });

  // Clic en mapa
    map.on('click', function(e) {
    const { lat, lng } = e.latlng;

    if (modo === 'inicio') {
        if (marcadorInicio) marcadorInicio.setLatLng([lat, lng]);
        else marcadorInicio = L.marker([lat, lng], { draggable: true }).addTo(map);
        marcadorInicio.bindPopup(`📍 Inicio<br>Lat: ${lat.toFixed(5)}<br>Lng: ${lng.toFixed(5)}`).openPopup();
        marcadorInicio.on('dragend', calcularRuta);

    } else if (modo === 'destino') {
        if (marcadorDestino) marcadorDestino.setLatLng([lat, lng]);
        else marcadorDestino = L.marker([lat, lng], {
        draggable: true,
        icon: L.icon({
            iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
            iconSize: [35, 35],
            iconAnchor: [17, 34]
        })
        }).addTo(map);
        marcadorDestino.bindPopup(`🎯 Destino<br>Lat: ${lat.toFixed(5)}<br>Lng: ${lng.toFixed(5)}`).openPopup();
        marcadorDestino.on('dragend', calcularRuta);
    }

    calcularRuta();
    });

  // Calcular ruta y distancia
    function calcularRuta() {
    if (!marcadorInicio || !marcadorDestino) return;

    const coordInicio = marcadorInicio.getLatLng();
    const coordDestino = marcadorDestino.getLatLng();

    const url = `https://router.project-osrm.org/route/v1/driving/${coordInicio.lng},${coordInicio.lat};${coordDestino.lng},${coordDestino.lat}?overview=full&geometries=geojson`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const distanciaKm = (route.distance / 1000).toFixed(2);
            distanciaDiv.textContent = `Distancia: ${distanciaKm} km`;

            const rutaCoords = route.geometry.coordinates.map(c => [c[1], c[0]]);
            if (ruta) map.removeLayer(ruta);
            ruta = L.polyline(rutaCoords, { color: 'blue', weight: 5 }).addTo(map);
            map.fitBounds(ruta.getBounds());
        } else {
            distanciaDiv.textContent = "Distancia: —";
        }
        })
        .catch(err => console.error("Error al calcular la ruta:", err));
    }

  // Zoom al marcador activo
    document.getElementById('zoomBtn').addEventListener('click', () => {
    let objetivo = null;
    if (modo==='inicio' && marcadorInicio) objetivo=marcadorInicio;
    else if (modo==='destino' && marcadorDestino) objetivo=marcadorDestino;
    if (objetivo) { map.flyTo(objetivo.getLatLng(),15); objetivo.openPopup(); }
    else alert("Selecciona un marcador activo (inicio o destino).");
    });

  // Buscar coordenadas
    document.getElementById('buscarBtn').addEventListener('click', () => {
    const lat = parseFloat(document.getElementById('latInput').value);
    const lng = parseFloat(document.getElementById('lngInput').value);

    if (isNaN(lat) || isNaN(lng)) { alert("Introduce coordenadas válidas"); return; }

    if (modo==='inicio' && marcadorInicio) marcadorInicio.setLatLng([lat, lng]).openPopup();
    else if (modo==='destino' && marcadorDestino) marcadorDestino.setLatLng([lat, lng]).openPopup();
    else if (modo==='inicio' && !marcadorInicio) {
        marcadorInicio = L.marker([lat, lng], { draggable:true }).addTo(map)
        .bindPopup(`📍 Inicio<br>Lat:${lat.toFixed(5)}<br>Lng:${lng.toFixed(5)}`).openPopup();
        marcadorInicio.on('dragend', calcularRuta);
    } else if (modo==='destino' && !marcadorDestino) {
        marcadorDestino = L.marker([lat, lng], {
        draggable:true,
        icon:L.icon({iconUrl:'https://cdn-icons-png.flaticon.com/512/684/684908.png',iconSize:[35,35],iconAnchor:[17,34]})
        }).addTo(map)
        .bindPopup(`🎯 Destino<br>Lat:${lat.toFixed(5)}<br>Lng:${lng.toFixed(5)}`).openPopup();
        marcadorDestino.on('dragend', calcularRuta);
    } else { alert("Selecciona un marcador activo antes de buscar."); return; }

    map.flyTo([lat, lng], 15);
    calcularRuta();
    });

  // Resaltar botón activo
    function activarBoton(id) {
    document.querySelectorAll('#sidebar button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    }
    
    document.getElementById('btnClima').addEventListener('click', function () {
    // redirige a la ruta /clima
    window.location.href = '/clima';
    });
  
  
    document.getElementById('GuardarRutaBtn').addEventListener('click', function () {
      const userId = document.getElementById('app').dataset.userId;
      // validar userId
  if (!userId) { alert('Falta id de usuario'); return; }

  // comprueba que las variables globales existan y tengan marcadores
  if (typeof marcadorInicio === 'undefined' || typeof marcadorDestino === 'undefined' || !marcadorInicio || !marcadorDestino) {
    alert('Debe establecer ambos marcadores: inicio y destino antes de guardar la ruta.');
    return;
  }

  // extraer lat/lng
  const inicio = marcadorInicio.getLatLng();
  const destino = marcadorDestino.getLatLng();

  if (!inicio || !destino) {
    alert('No se pudieron leer las coordenadas de los marcadores.');
    return;
  }

  // formateo de valores (usa toFixed si quieres limitar decimales)
  const latInicio = inicio.lat.toFixed(6);
  const lngInicio = inicio.lng.toFixed(6);
  const latDestino = destino.lat.toFixed(6);
  const lngDestino = destino.lng.toFixed(6);

  // codificar para URL
  const a = encodeURIComponent(latInicio);
  const b = encodeURIComponent(lngInicio);
  const c = encodeURIComponent(latDestino);
  const d = encodeURIComponent(lngDestino);
  // construir y navegar a la ruta 
  const url = `/mapa/ruta/create/${encodeURIComponent(userId)}/${a}/${b}/${c}/${d}`;
  window.location.href = url;
  });

  document.getElementById('MisRutasBtn').addEventListener('click', function () {
  const userId = document.getElementById('app').dataset.userId;
  // validar userId
  if (!userId) { alert('Falta id de usuario'); return; }
  // construir y navegar a la ruta 
  const url = `/mapa/ruta/mis_rutas/${encodeURIComponent(userId)}`;
  window.location.href = url;
  });