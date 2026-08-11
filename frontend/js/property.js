/* Editado: renderiza o card de vídeo do imóvel apenas quando houver link válido do YouTube e converte a URL para embed responsivo. */
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("error-message");
const propertyDetails = document.getElementById("property-details");

const mainImage = document.getElementById("main-image");
const thumbnailList = document.getElementById("thumbnail-list");
const galleryPrev = document.getElementById("gallery-prev");
const galleryNext = document.getElementById("gallery-next");

const propertyTitle = document.getElementById("property-title");
const propertyPrice = document.getElementById("property-price");
const propertyLocation = document.getElementById("property-location");
const propertyAddress = document.getElementById("property-address");
const propertyDescription = document.getElementById("property-description");
const propertyVideoCard = document.getElementById("property-video-card");
const propertyVideoIframe = document.getElementById("property-video-iframe");
const whatsappCta = document.getElementById("whatsapp-cta");

/* Numero oficial de atendimento, no formato aceito pelo wa.me (DDI + DDD + numero). */
const WHATSAPP_NUMBER = "5527988437763";

function formatPrice(value) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function getPropertyIdFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("id");
}

/* Galeria: imagens carregadas e indice exibido no momento. */
let galleryImages = [];
let currentImageIndex = 0;

/* Troca a imagem principal e destaca a miniatura correspondente.
   O indice circula, entao avancar na ultima imagem volta para a primeira. */
function setActiveImage(index) {
  if (galleryImages.length === 0) return;

  const total = galleryImages.length;
  currentImageIndex = (index + total) % total;

  mainImage.src = galleryImages[currentImageIndex].url;

  thumbnailList.querySelectorAll("img").forEach((thumb, thumbIndex) => {
    const isActive = thumbIndex === currentImageIndex;
    thumb.classList.toggle("is-active", isActive);
    thumb.setAttribute("aria-current", isActive ? "true" : "false");
  });
}

function renderImages(images) {
  galleryImages =
    images && images.length > 0
      ? images
      : [{ url: "./assets/placeholder.jpg" }];

  thumbnailList.innerHTML = "";

  galleryImages.forEach((image, index) => {
    const thumb = document.createElement("img");
    thumb.src = image.url;
    thumb.alt = `Miniatura ${index + 1} do imóvel`;
    thumb.tabIndex = 0;
    thumb.setAttribute("role", "button");

    thumb.addEventListener("click", () => setActiveImage(index));

    thumb.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        setActiveImage(index);
      }
    });

    thumbnailList.appendChild(thumb);
  });

  /* Com uma unica imagem as setas nao tem funcao. */
  const hasMultipleImages = galleryImages.length > 1;
  galleryPrev.hidden = !hasMultipleImages;
  galleryNext.hidden = !hasMultipleImages;

  setActiveImage(0);
}

galleryPrev.addEventListener("click", () => {
  setActiveImage(currentImageIndex - 1);
});

galleryNext.addEventListener("click", () => {
  setActiveImage(currentImageIndex + 1);
});

function renderPropertyVideo(videoUrl) {
  const embedUrl = window.propertyVideoUtils?.getYouTubeEmbedUrl(videoUrl);

  if (!embedUrl) {
    propertyVideoIframe.src = "";
    propertyVideoCard.classList.add("hidden");
    return;
  }

  propertyVideoIframe.src = embedUrl;
  propertyVideoCard.classList.remove("hidden");
}

/* Monta o link do CTA com o titulo do imovel ja carregado, para que a conversa
   comece indicando qual anuncio gerou o contato. Sem titulo, o href estatico do
   HTML (mensagem generica) permanece valido. */
function renderWhatsappCta(title) {
  if (!whatsappCta || !title) return;

  const message = `Olá! Tenho interesse no imóvel ${title}`;
  whatsappCta.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    message
  )}`;
}

function renderProperty(property) {
  propertyTitle.textContent = property.title || "Imóvel";
  propertyPrice.textContent = formatPrice(property.price || 0);
  /* Os rotulos "Localizacao"/"Endereco" agora vem do HTML, entao aqui fica
     apenas o valor. As partes vazias sao descartadas para nao sobrar
     separador solto (ex.: " - Vila Velha/ES"). */
  const cityAndState = [property.city, property.state].filter(Boolean).join("/");

  propertyLocation.textContent =
    [property.neighborhood, cityAndState].filter(Boolean).join(" - ") ||
    "Não informado";

  propertyAddress.textContent = property.address || "Não informado";
  propertyDescription.textContent =
    property.description || "Sem descrição disponível.";

  renderImages(property.images);
  renderPropertyVideo(property.videoUrl);
  renderWhatsappCta(property.title);

  loading.classList.add("hidden");
  propertyDetails.classList.remove("hidden");
}

async function loadProperty() {
  const id = getPropertyIdFromUrl();

  if (!id) {
    loading.classList.add("hidden");
    errorMessage.classList.remove("hidden");
    errorMessage.textContent = "ID do imóvel não informado na URL.";
    return;
  }

  try {
    const property = await apiRequest(`/properties/public/${id}`);
    renderProperty(property);
  } catch (error) {
    loading.classList.add("hidden");
    errorMessage.classList.remove("hidden");
    errorMessage.textContent = error.message || "Erro ao carregar imóvel.";
  }
}

loadProperty();
