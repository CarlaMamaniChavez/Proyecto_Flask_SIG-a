
/* --- Inicialización de mapa y variables (tu código original) --- */
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

/* Obtener ubicación actual del usuario (igual que antes) */
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
    (err) => console.warn("⚠️ No se pudo obtener tu ubicación.", err)
  );
}

/* Calcular ruta y distancia (tu función original, sin cambios) */
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
    .catch(err => {
      console.error("Error al calcular la ruta:", err);
      distanciaDiv.textContent = "Distancia: —";
    });
}

/* --- Nuevo: manejar clicks/teclas en .ruta-item para colocar marcadores y calcular --- */

/* icono para destino (opcional, mismo recurso usado en tu app) */
const destinoIcon = L.icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
  iconSize: [35, 35],
  iconAnchor: [17, 34]
});

/* coloca/actualiza marcadores y recalcula la ruta */
function colocarMarcadoresYCalcular(latInicio, lngInicio, latDestino, lngDestino) {
  const li = Number(latInicio);
  const lni = Number(lngInicio);
  const ld = Number(latDestino);
  const lnd = Number(lngDestino);

  if (![li, lni, ld, lnd].every(v => Number.isFinite(v))) {
    alert('Coordenadas inválidas en la ruta seleccionada.');
    return;
  }

  // marcador inicio
  if (marcadorInicio) {
    marcadorInicio.setLatLng([li, lni]);
  } else {
    marcadorInicio = L.marker([li, lni], { draggable: true }).addTo(map);
    marcadorInicio.on('dragend', calcularRuta);
  }
  marcadorInicio.bindPopup(`📍 Inicio<br>Lat: ${li.toFixed(6)}<br>Lng: ${lni.toFixed(6)}`);

  // marcador destino
  if (marcadorDestino) {
    marcadorDestino.setLatLng([ld, lnd]);
  } else {
    marcadorDestino = L.marker([ld, lnd], { draggable: true, icon: destinoIcon }).addTo(map);
    marcadorDestino.on('dragend', calcularRuta);
  }
  marcadorDestino.bindPopup(`🎯 Destino<br>Lat: ${ld.toFixed(6)}<br>Lng: ${lnd.toFixed(6)}`);

  // abrir popups y ajustar vista
  marcadorInicio.openPopup();
  marcadorDestino.openPopup();
  map.fitBounds(L.latLngBounds([ [li, lni], [ld, lnd] ]).pad(0.2));

  // recalcular ruta
  calcularRuta();
}

/* inicializa manejadores para los items de la lista */
function initRutaItemClicks() {
  const rutasContainer = document.getElementById('rutas');
  if (!rutasContainer) return;

  // delegado para clicks (funciona si la lista se actualiza dinámicamente)
  rutasContainer.addEventListener('click', (ev) => {
    const item = ev.target.closest('.ruta-item');
    if (!item) return;
    const li = item.dataset.latinicio;
    const lni = item.dataset.lnginicio;
    const ld = item.dataset.latdestino;
    const lnd = item.dataset.lngdestino;
    colocarMarcadoresYCalcular(li, lni, ld, lnd);

    // marcar visualmente el item seleccionado
    document.querySelectorAll('.ruta-item').forEach(el => el.classList.remove('selected'));
    item.classList.add('selected');
  });

  // soporte teclado: Enter o Espacio activa el mismo comportamiento
  rutasContainer.addEventListener('keydown', (ev) => {
    const item = ev.target.closest('.ruta-item');
    if (!item) return;
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      const li = item.dataset.latinicio;
      const lni = item.dataset.lnginicio;
      const ld = item.dataset.latdestino;
      const lnd = item.dataset.lngdestino;
      colocarMarcadoresYCalcular(li, lni, ld, lnd);

      document.querySelectorAll('.ruta-item').forEach(el => el.classList.remove('selected'));
      item.classList.add('selected');
    }
  });
}

/* Ejecutar inicialización tras definirse el DOM y mapa */
initRutaItemClicks();
