const SUPABASE_URL = "https://hqsiglpdnylsfbideglc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_elNqKmc2_3zpeDxrlFKMFw_RdDz4nXz";

async function cargarVehiculos() {
  const stock = document.getElementById("stock");

  try {
    const respuesta = await fetch(
      `${SUPABASE_URL}/rest/v1/GLOW-CARS?select=*`,
      {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`
        }
      }
    );

    if (!respuesta.ok) {
      throw new Error("No se pudieron cargar los vehículos");
    }

    const vehiculos = await respuesta.json();

    if (!vehiculos.length) {
      stock.innerHTML = "<p>No hay vehículos disponibles.</p>";
      return;
    }

    stock.innerHTML = vehiculos.map(vehiculo => `
      <article class="card">
        <img src="${vehiculo.Imagen || ""}" alt="${vehiculo['Marca-modelo'] || 'Vehículo'}">
        <h2>${vehiculo['Marca-modelo'] || ""}</h2>
        <p><strong>Precio:</strong> ${vehiculo.Precio || ""}</p>
        <p><strong>Año:</strong> ${vehiculo.Año || ""}</p>
        <p><strong>Kilómetros:</strong> ${vehiculo['Kilómetros'] || ""}</p>
        <p><strong>Combustible:</strong> ${vehiculo.Combustible || ""}</p>
        <p><strong>Cambio:</strong> ${vehiculo.Cambio || ""}</p>
        <p>${vehiculo.Descripción || ""}</p>
      </article>
    `).join("");

  } catch (error) {
    console.error(error);
    stock.innerHTML = "<p>Error al cargar los vehículos.</p>";
  }
}

cargarVehiculos();
