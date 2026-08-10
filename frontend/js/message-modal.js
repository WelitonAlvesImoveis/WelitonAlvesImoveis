/* Componente reutilizavel de mensagem: substitui o alert() nativo do navegador.
   Uso: showMessage("Texto da mensagem", "success" | "error")
   Retorna uma Promise resolvida quando a mensagem e fechada, permitindo
   aguardar a leitura antes de navegar/recarregar a pagina. */
(function () {
  const AUTO_DISMISS_MS = 2600;
  const ANIMATION_FALLBACK_MS = 400;

  function getContainer() {
    let container = document.getElementById("app-message-container");

    if (!container) {
      container = document.createElement("div");
      container.id = "app-message-container";
      container.className = "app-message-container";
      document.body.appendChild(container);
    }

    return container;
  }

  function showMessage(text, type) {
    const messageType = type === "error" ? "error" : "success";

    return new Promise((resolve) => {
      const message = document.createElement("div");
      message.className = `app-message app-message--${messageType}`;
      message.setAttribute("role", messageType === "error" ? "alert" : "status");
      message.setAttribute(
        "aria-live",
        messageType === "error" ? "assertive" : "polite",
      );

      const icon = document.createElement("span");
      icon.className = "app-message__icon";
      icon.setAttribute("aria-hidden", "true");
      icon.textContent = messageType === "error" ? "!" : "✓";

      const content = document.createElement("p");
      content.className = "app-message__text";
      content.textContent = text;

      const closeButton = document.createElement("button");
      closeButton.type = "button";
      closeButton.className = "app-message__close";
      closeButton.setAttribute("aria-label", "Fechar mensagem");
      closeButton.textContent = "×";

      message.appendChild(icon);
      message.appendChild(content);
      message.appendChild(closeButton);
      getContainer().appendChild(message);

      requestAnimationFrame(() => {
        message.classList.add("is-visible");
      });

      let timer = null;
      let isClosing = false;
      let isFinished = false;

      function finish() {
        if (isFinished) return;
        isFinished = true;
        message.remove();
        resolve();
      }

      function close() {
        if (isClosing) return;
        isClosing = true;
        clearTimeout(timer);
        message.classList.remove("is-visible");
        message.addEventListener("transitionend", finish, { once: true });
        setTimeout(finish, ANIMATION_FALLBACK_MS);
      }

      closeButton.addEventListener("click", close);
      timer = setTimeout(close, AUTO_DISMISS_MS);
    });
  }

  window.showMessage = showMessage;
})();
