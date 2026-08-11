(function attachPropertyPriceUtils() {
  const MAX_DIGITS = 15;

  function onlyDigits(value) {
    if (value === null || value === undefined) {
      return "";
    }

    return String(value).replace(/\D/g, "");
  }

  function normalizeDigits(value) {
    return onlyDigits(value).replace(/^0+(?=\d)/, "").slice(0, MAX_DIGITS);
  }

  // "350000" -> "350.000" | "" -> ""
  function formatPrice(value) {
    const digits = normalizeDigits(value);

    if (!digits) {
      return "";
    }

    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // "350.000" -> "350000" 
  function toRawPrice(value) {
    return normalizeDigits(value);
  }

  function countDigits(text) {
    return (String(text).match(/\d/g) || []).length;
  }

  function caretAfterDigit(formattedValue, digitCount) {
    if (digitCount <= 0) {
      return 0;
    }

    let seenDigits = 0;

    for (let index = 0; index < formattedValue.length; index += 1) {
      if (/\d/.test(formattedValue[index])) {
        seenDigits += 1;

        if (seenDigits === digitCount) {
          return index + 1;
        }
      }
    }

    return formattedValue.length;
  }

  function applyMask(input, digitsBeforeCaret) {
    const formattedValue = formatPrice(input.value);
    input.value = formattedValue;

    if (typeof digitsBeforeCaret !== "number" || !input.setSelectionRange) {
      return;
    }

    const caretPosition = caretAfterDigit(formattedValue, digitsBeforeCaret);

    try {
      input.setSelectionRange(caretPosition, caretPosition);
    } catch (error) {
      
    }
  }

  function getCaret(input, fallback) {
    return typeof input.selectionStart === "number"
      ? input.selectionStart
      : fallback;
  }

  function handleInput(event) {
    const input = event.target;
    const caretPosition = getCaret(input, input.value.length);
    const digitsBeforeCaret = countDigits(input.value.slice(0, caretPosition));

    applyMask(input, digitsBeforeCaret);
  }

  // Backspace em cima de um separador deve apagar o dígito anterior, não o ponto.
  function handleKeydown(event) {
    if (event.key !== "Backspace") {
      return;
    }

    const input = event.target;
    const selectionStart = getCaret(input, null);
    const selectionEnd =
      typeof input.selectionEnd === "number" ? input.selectionEnd : null;

    if (
      selectionStart === null ||
      selectionStart !== selectionEnd ||
      selectionStart < 2 ||
      input.value[selectionStart - 1] !== "."
    ) {
      return;
    }

    event.preventDefault();

    const nextValue =
      input.value.slice(0, selectionStart - 2) + input.value.slice(selectionStart);
    const digitsBeforeCaret = countDigits(nextValue.slice(0, selectionStart - 2));

    input.value = nextValue;
    applyMask(input, digitsBeforeCaret);
  }

  function handlePaste(event) {
    const clipboard = event.clipboardData || window.clipboardData;

    if (!clipboard) {
      return;
    }

    const input = event.target;
    const pastedText = clipboard.getData("text") || "";
    const pastedDigits = onlyDigits(pastedText.replace(/[.,]\d{1,2}\s*$/, ""));

    event.preventDefault();

    const selectionStart = getCaret(input, input.value.length);
    const selectionEnd =
      typeof input.selectionEnd === "number"
        ? input.selectionEnd
        : input.value.length;

    const nextValue =
      input.value.slice(0, selectionStart) +
      pastedDigits +
      input.value.slice(selectionEnd);
    const digitsBeforeCaret =
      countDigits(input.value.slice(0, selectionStart)) + pastedDigits.length;

    input.value = nextValue;
    applyMask(input, digitsBeforeCaret);
  }

  function setMaskedValue(input, value) {
    if (!input) {
      return;
    }

    input.value = formatPrice(value);
  }

  function attachPriceMask(input) {
    if (!input || input.dataset.priceMask === "on") {
      return;
    }

    input.dataset.priceMask = "on";

    input.addEventListener("keydown", handleKeydown);
    input.addEventListener("paste", handlePaste);
    input.addEventListener("input", handleInput);
    input.value = formatPrice(input.value);
  }

  window.propertyPriceUtils = {
    formatPrice,
    toRawPrice,
    setMaskedValue,
    attachPriceMask,
  };
})();
