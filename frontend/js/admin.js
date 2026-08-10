const logoutButton = document.getElementById("logout-button");
const loadingMessage = document.getElementById("loading-message");
const errorMessage = document.getElementById("error-message");
const emptyMessage = document.getElementById("empty-message");
const propertiesList = document.getElementById("properties-list");

function getToken() {
  return localStorage.getItem("token");
}

function logout() {
  localStorage.removeItem("token");
  window.location.href = "../index.html";
}

function protectPage() {
  const token = getToken();

  if (!token) {
    window.location.href = "./login.html";
    return null;
  }

  return token;
}

function formatPrice(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function createPropertyCover(property) {
  const coverImage = property.images?.[0]?.url;

  if (!coverImage) {
    return `<div class="card-cover-empty">Sem imagem principal</div>`;
  }

  return `
    <a
      href="${coverImage}"
      target="_blank"
      rel="noopener noreferrer"
      class="card-cover-link"
      aria-label="Abrir imagem principal de ${property.title}"
    >
      <img
        src="${coverImage}"
        alt="Imagem principal de ${property.title}"
        class="card-cover-image"
      />
    </a>
  `;
}


function truncateWords(text = "", maxWords = 22) {
  const words = text.trim().split(/\s+/);

  if (words.length <= maxWords) return text;

  return words.slice(0, maxWords).join(" ") + "...";
}

function createPropertyCard(property) {
  const location = `${property.neighborhood || ""}${property.neighborhood ? " - " : ""}${property.city || ""}/${property.state || ""}`;

  return `
    <article class="admin-property-card">
      <h2>${property.title}</h2>

      ${createPropertyCover(property)}

      <p><strong>Preço:</strong> ${formatPrice(property.price || 0)}</p>
      <p><strong>Local:</strong> ${location}</p>
      <p><strong>Descrição:</strong> ${truncateWords(property.description || "Sem descrição", 22)}</p>

      <div class="card-actions">
        <a href="./edit-property.html?id=${property._id}">Editar</a>
        <button type="button" class="delete-property" data-id="${property._id}">
          Excluir
        </button>
      </div>
    </article>
  `;
}

async function loadAdminProperties() {
  const token = protectPage();

  if (!token) return;

  try {
    const properties = await fetch(`${API_BASE_URL}/api/properties`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await properties.json();

    if (!properties.ok) {
      throw new Error(data.message || "Erro ao carregar imóveis.");
    }

    loadingMessage.classList.add("hidden");

    if (!data || data.length === 0) {
      emptyMessage.classList.remove("hidden");
      return;
    }

    propertiesList.innerHTML = data.map(createPropertyCard).join("");
    propertiesList.classList.remove("hidden");
  } catch (error) {
    loadingMessage.classList.add("hidden");
    errorMessage.classList.remove("hidden");
    errorMessage.textContent = error.message;

    if (
      error.message.toLowerCase().includes("token") ||
      error.message.toLowerCase().includes("unauthorized") ||
      error.message.toLowerCase().includes("não autorizado")
    ) {
      logout();
    }
  }
}

/* EXCLUIR IMÓVEL */
document.addEventListener("click", async (event) => {
  if (!event.target.classList.contains("delete-property")) return;

  const id = event.target.dataset.id;
  const token = getToken();

  const confirmDelete = confirm("Deseja realmente excluir este imóvel?");
  if (!confirmDelete) return;

  try {
    const response = await fetch(`${API_BASE_URL}/api/properties/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao excluir imóvel.");
    }

    await showMessage("Imóvel removido com sucesso.", "success");
    location.reload();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

if (logoutButton) {
  logoutButton.addEventListener("click", logout);
}

loadAdminProperties();
