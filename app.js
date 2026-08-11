const SUPABASE_URL = "https://hqsiglpdnylsfbideglc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_elNqKmc2_3zpeDxrlFKMFw_RdDz4nXz";
async function cargarVehiculos() {
    const stock = document.getElementById("stock");
    if (!stock) {
        console.error("No existe el elemento #stock en index.html");
        return;
    }
    stock.innerHTML = `
        <div class="loading-stock">
            <p>Cargando vehículos...</p>
        </div>
    `;
    try {
        const respuesta = await fetch(
            `${SUPABASE_URL}/rest/v1/GLOW-CARS?select=*`,
            {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );
        if (!respuesta.ok) {
            const detalle = await respuesta.text();
            console.error(
                "Error de Supabase:",
                respuesta.status,
                detalle
            );
            throw new Error(
                `Error ${respuesta.status} al consultar Supabase`
            );
        }
        const vehiculos = await respuesta.json();
        console.log("Vehículos recibidos:", vehiculos);
        if (!Array.isArray(vehiculos) || vehiculos.length === 0) {
            stock.innerHTML = `
                <div class="empty-stock">
                    <h3>No hay vehículos disponibles</h3>
                    <p>
                        Actualmente no tenemos vehículos publicados.
                    </p>
                </div>
            `;
            return;
        }
        stock.innerHTML = vehiculos.map(vehiculo => {
            const nombre =
                vehiculo["Marca-modelo"] ||
                vehiculo["marca-modelo"] ||
                vehiculo["marca_modelo"] ||
                vehiculo["Modelo"] ||
                vehiculo["modelo"] ||
                "Vehículo GLOW CARS";
            const imagen =
                vehiculo["Imagen"] ||
                vehiculo["imagen"] ||
                vehiculo["Image"] ||
                "";
            const precio =
                vehiculo["Precio"] ||
                vehiculo["precio"] ||
                "";
            const año =
                vehiculo["Año"] ||
                vehiculo["año"] ||
                vehiculo["Ano"] ||
                "";
            const kilometros =
                vehiculo["Kilómetros"] ||
                vehiculo["kilometros"] ||
                vehiculo["Kilometros"] ||
                vehiculo["km"] ||
                "";
            const combustible =
                vehiculo["Combustible"] ||
                vehiculo["combustible"] ||
                "";
            const cambio =
                vehiculo["Cambio"] ||
                vehiculo["cambio"] ||
                "";
            const descripcion =
                vehiculo["Descripción"] ||
                vehiculo["descripcion"] ||
                "";
            const precioFormateado =
                precio !== ""
                    ? Number(precio).toLocaleString("es-ES", {
                        style: "currency",
                        currency: "EUR",
                        maximumFractionDigits: 0
                    })
                    : "";
            return `
                <article class="card">
                    <div class="card-image">
                        ${
                            imagen
                            ?
                            `<img
                                src="${escapar(imagen)}"
                                alt="${escapar(nombre)}"
                                loading="lazy"
                            >`
                            :
                            `<div class="sin-imagen">
                                GLOW CARS
                            </div>`
                        }
                    </div>
                    <div class="card-content">
                        <span class="card-label">
                            GLOW CARS · PREMIUM SELECTION
                        </span>
                        <h2>
                            ${escapar(nombre)}
                        </h2>
                        ${
                            precioFormateado
                            ?
                            `<div class="card-price">
                                ${precioFormateado}
                            </div>`
                            :
                            ""
                        }
                        <div class="card-specs">
                            ${
                                año
                                ?
                                `<span>
                                    ${escapar(año)}
                                </span>`
                                :
                                ""
                            }
                            ${
                                kilometros
                                ?
                                `<span>
                                    ${Number(kilometros).toLocaleString("es-ES")} km
                                </span>`
                                :
                                ""
                            }
                            ${
                                combustible
                                ?
                                `<span>
                                    ${escapar(combustible)}
                                </span>`
                                :
                                ""
                            }
                            ${
                                cambio
                                ?
                                `<span>
                                    ${escapar(cambio)}
                                </span>`
                                :
                                ""
                            }
                        </div>
                        ${
                            descripcion
                            ?
                            `<p class="card-description">
                                ${escapar(descripcion)}
                            </p>`
                            :
                            ""
                        }
                        <a
                            href="#contacto"
                            class="card-button"
                        >
                            Me interesa
                        </a>
                    </div>
                </article>
            `;
        }).join("");
    } catch (error) {
        console.error(
            "GLOW CARS - Error:",
            error
        );
        stock.innerHTML = `
            <div class="empty-stock">
                <h3>
                    No se ha podido cargar el catálogo
                </h3>
                <p>
                    Comprueba la conexión con nuestro stock.
                </p>
            </div>
        `;
    }
}
/* Evita problemas si existen caracteres especiales */
function escapar(valor) {
    return String(valor ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
/* Iniciar catálogo */
cargarVehiculos();
