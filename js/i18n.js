const translations = {
  pt: {
    enter: "ENTRAR",
    back: "VOLTAR",
    back_shop: "← Voltar",
    checkout: "Checkout",
    order_summary: "Resumo do pedido",
    payment: "Pagamento",
    select_size: "Selecionar tamanho",
    selected_size: "Tamanho selecionado",
    add_to_cart: "Adicionar ao carrinho",
    cart: "Carrinho",
    total: "Total",
    product_jacket: "JAQUETA — BLACK CHROME",
    product_pants: "CALÇA — BLACK CHROME",
    product_shirt: "CAMISA — BLACK CHROME"
  },

  en: {
    enter: "ENTER",
    back: "BACK",
    back_shop: "← Back to shop",
    checkout: "Checkout",
    order_summary: "Order summary",
    payment: "Payment",
    select_size: "Select size",
    selected_size: "Selected size",
    add_to_cart: "Add to my cart",
    cart: "Cart",
    total: "Total",
    product_jacket: "JACKET — BLACK CHROME",
    product_pants: "PANTS — BLACK CHROME",
    product_shirt: "SHIRT — BLACK CHROME"
  },

  fr: {
    enter: "ENTRER",
    back: "RETOUR",
    back_shop: "← Retour",
    checkout: "Paiement",
    order_summary: "Résumé de la commande",
    payment: "Paiement",
    select_size: "Choisir la taille",
    selected_size: "Taille sélectionnée",
    add_to_cart: "Ajouter au panier",
    cart: "Panier",
    total: "Total",
    product_jacket: "VESTE — BLACK CHROME",
    product_pants: "PANTALON — BLACK CHROME",
    product_shirt: "CHEMISE — BLACK CHROME"
  }
};

function setLanguage(lang) {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang][key]) {
      el.textContent = translations[lang][key];
    }
  });
  localStorage.setItem("lang", lang);
}

document.addEventListener("DOMContentLoaded", () => {
  const savedLang = localStorage.getItem("lang") || "en";
  setLanguage(savedLang);
});


