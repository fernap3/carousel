function PageLoad() {
    let c = new Carousel(document.querySelector(".presentationArea"));
    for (let i = 0; i < 5; i++) {
        let item = document.createElement("div");
        item.className = "demoItem";
        item.innerHTML = i + 1 + "";
        c.AddItem(item);
    }
    c.Show();
}
//# sourceMappingURL=main.js.map