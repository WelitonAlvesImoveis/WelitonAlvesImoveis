const loadingMessage = document.getElementById("loading-message");
const errorMessage = document.getElementById("error-message");
const form = document.getElementById("edit-property-form");
const currentImagesList = document.getElementById("current-images-list");
const videoUrlInput = document.getElementById("videoUrl");
const priceInput = document.getElementById("price");

window.propertyPriceUtils?.attachPriceMask(priceInput);

function getToken() {
  return localStorage.getItem("token");
}

function protectPage() {
  const token = getToken();

  if (!token) {
    window.location.href = "./login.html";
    return null;
  }

  return token;
}

function getPropertyIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

function renderCurrentImages(images = [], propertyId) {
  if (!images.length) {
    currentImagesList.innerHTML =
      "<p>Este imóvel ainda não possui imagens.</p>";
    return;
  }

  currentImagesList.innerHTML = images
    .map((image, index) => {
      return `
        <div class="current-image-card">
          <img src="${image.url}" alt="Imagem ${index + 1} do imóvel" />
          <p>${index === 0 ? "Imagem principal" : `Imagem ${index + 1}`}</p>
          <button
            type="button"
            class="delete-image-btn"
            data-property="${propertyId}"
            data-publicid="${image.publicId}"
          >
            Excluir imagem
          </button>
        </div>
      `;
    })
    .join("");
}

async function loadProperty() {
  const token = protectPage();
  const propertyId = getPropertyIdFromUrl();

  if (!token || !propertyId) {
    errorMessage.textContent = "Imóvel não encontrado.";
    errorMessage.classList.remove("hidden");
    loadingMessage.classList.add("hidden");
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/properties`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao carregar imóvel.");
    }

    const property = data.find((item) => item._id === propertyId);

    if (!property) {
      throw new Error("Imóvel não encontrado.");
    }

    document.getElementById("title").value = property.title || "";
    document.getElementById("description").value = property.description || "";
    window.propertyPriceUtils?.setMaskedValue(priceInput, property.price ?? "");
    document.getElementById("city").value = property.city || "";
    document.getElementById("state").value = property.state || "";
    document.getElementById("neighborhood").value = property.neighborhood || "";
    document.getElementById("address").value = property.address || "";
    videoUrlInput.value = property.videoUrl || "";

    renderCurrentImages(property.images || [], property._id);

    loadingMessage.classList.add("hidden");
    form.classList.remove("hidden");
  } catch (error) {
    loadingMessage.classList.add("hidden");
    errorMessage.textContent = error.message;
    errorMessage.classList.remove("hidden");
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const token = protectPage();
  const propertyId = getPropertyIdFromUrl();

  if (!token || !propertyId) return;

  try {
    const normalizedVideoUrl = window.propertyVideoUtils?.normalizeVideoUrl(
      videoUrlInput?.value,
    ) || "";

    if (
      normalizedVideoUrl &&
      !window.propertyVideoUtils?.isValidYouTubeUrl(normalizedVideoUrl)
    ) {
      throw new Error(
        "Informe um link v\u00e1lido do YouTube para o v\u00eddeo do im\u00f3vel.",
      );
    }

    const rawPrice =
      window.propertyPriceUtils?.toRawPrice(priceInput?.value) ?? "";

    if (!rawPrice) {
      throw new Error("Informe o preço do imóvel.");
    }

    const formData = new FormData(form);
    formData.set("videoUrl", normalizedVideoUrl);
    formData.set("price", rawPrice);

    const response = await fetch(`${API_BASE_URL}/api/properties/${propertyId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao atualizar imóvel.");
    }

    await showMessage("Imóvel atualizado com sucesso.", "success");
    window.location.href = "./dashboard.html";
  } catch (error) {
    showMessage(error.message, "error");
  }
});

document.addEventListener("click", async (event) => {
  if (!event.target.classList.contains("delete-image-btn")) return;

  const token = protectPage();
  const propertyId = event.target.dataset.property;
  const publicId = event.target.dataset.publicid;

  if (!token || !propertyId || !publicId) return;

  const confirmDelete = confirm("Deseja realmente excluir esta imagem?");
  if (!confirmDelete) return;

  try {
    const encodedPublicId = encodeURIComponent(publicId);

    const response = await fetch(
      `${API_BASE_URL}/api/properties/${propertyId}/images/${encodedPublicId}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Erro ao excluir imagem.");
    }

    showMessage("Imagem removida com sucesso.", "success");
    loadProperty();
  } catch (error) {
    showMessage(error.message, "error");
  }
});

loadProperty();
