class Product {
  title = "Default";
  imageUrl;
  description;
  price;
}

const productList = {
  products: [
    {
      title: "A Pillow",
      imageUrl:
        "https://www.google.com/imgres?imgurl=https%3A%2F%2Fdfstudio-d420.kxcdn.com%2Fwordpress%2Fwp-content%2Fuploads%2F2019%2F06%2Fdigital_camera_photo-1080x675.jpg&tbnid=0kl2WrGN8BrkhM&vet=12ahUKEwj666Deq4KCAxWNwGEKHX2iBsYQMygDegQIARBP..i&imgrefurl=https%3A%2F%2Fwww.dfstudio.com%2Fdigital-image-size-and-resolution-what-do-you-need-to-know%2F&docid=KEFtss0dYCDpzM&w=1080&h=675&q=image&ved=2ahUKEwj666Deq4KCAxWNwGEKHX2iBsYQMygDegQIARBP",
      price: 19.99,
      description: "A Soft Pillow",
    },
    {
      title: "A Carpet",
      imageUrl:
        "https://www.google.com/imgres?imgurl=https%3A%2F%2Fcdn.pixabay.com%2Fphoto%2F2015%2F04%2F19%2F08%2F32%2Fmarguerite-729510_640.jpg&tbnid=3i57MsBMZMQAlM&vet=12ahUKEwj666Deq4KCAxWNwGEKHX2iBsYQMygUegQIARBz..i&imgrefurl=https%3A%2F%2Fpixabay.com%2Fimages%2Fsearch%2Fwhite%2F&docid=12wSnUzcKouipM&w=640&h=417&q=image&ved=2ahUKEwj666Deq4KCAxWNwGEKHX2iBsYQMygUegQIARBz",
      price: 30.99,
      description: "A Soft Carpt",
    },
  ],
  render() {
    const renderHook = document.getElementById("app");
    const prodList = document.createElement("ul");
    prodList.className = "product-list";

    for (const prod of this.products) {
      const prodEL = document.createElement("li");
      prodEL.className = "product-item";
      prodEL.innerHTML = `
      <div>
        <img src = "${prod.imageUrl}" alt = "${prod.title}">
        <div class="product-item__content>
          <h2>${prod.price}</h2>
          <p>${prod.description}</p>
          <button>Add to Cart</button>
        </div>
      </div>`;
      prodList.append(prodEL);
    }
    renderHook.append(prodList);
  },
};

productList.render();
