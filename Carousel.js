class Carousel {
    constructor(container) {
        this.items = [];
        this.previewItems = [];
        this.container = container;
        this.itemContainer = document.createElement("div");
        this.itemContainer.className = "carouselItemContainer";
        this.container.appendChild(this.itemContainer);
        this.previewBar = document.createElement("div");
        this.previewBar.className = "carouselPreviewBar";
        this.container.appendChild(this.previewBar);
        this.leftSwitchButton = document.createElement("button");
        this.leftSwitchButton.className = "switchButton leftSwitchButton";
        this.leftSwitchButton.type = "button";
        this.leftSwitchButton.onclick = (evt) => { this.SwitchLeft(); };
        this.itemContainer.appendChild(this.leftSwitchButton);
        this.rightSwitchButton = document.createElement("button");
        this.rightSwitchButton.className = "switchButton rightSwitchButton";
        this.rightSwitchButton.type = "button";
        this.rightSwitchButton.onclick = (evt) => { this.SwitchRight(); };
        this.itemContainer.appendChild(this.rightSwitchButton);
        document.addEventListener("mousemove", (evt) => this.OnMouseMove(evt));
    }
    AddItem(item) {
        let itemButton = document.createElement("div");
        itemButton.className = "carouselPreviewItem";
        itemButton.style.display = "none";
        let itemIndex = this.items.length;
        itemButton.onclick = (evt) => { this.ShowItem(itemIndex); };
        this.previewBar.appendChild(itemButton);
        this.previewItems.push(itemButton);
        let itemBox = document.createElement("div");
        itemBox.className = "carouselItem";
        itemBox.appendChild(item);
        this.items.push(itemBox);
        itemBox.addEventListener("transitionend", (evt) => {
            if (!itemBox.hasAttribute("data-slidingout"))
                return;
            itemBox.remove();
            itemBox.style.position = "";
        });
    }
    Show() {
        let previewBarWidth = this.previewBar.offsetWidth;
        let keyframes = [
            { transform: `translateX(${previewBarWidth}px)` },
            { transform: "none" },
        ];
        let options = {
            duration: 1000,
            easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
            fill: "backwards"
        };
        for (let i = 0; i < this.previewItems.length; i++) {
            let itemButton = this.previewItems[i];
            options.delay = 100 * i;
            itemButton.animate(keyframes, options);
            itemButton.style.display = "";
        }
        this.ShowItem(0);
    }
    OnMouseMove(evt) {
        let target = evt.target;
        if (!target.closest(".carouselPreviewBar")) {
            for (let itemButton of this.previewItems)
                itemButton.style.transform = "";
            return;
        }
        let previewBarBounds = this.previewBar.getBoundingClientRect();
        let mouseX = evt.clientX - previewBarBounds.left;
        let relativeMousePos = mouseX / previewBarBounds.width;
        const inputScale = 2;
        let itemScales = [];
        for (let i = 0; i < this.previewItems.length; i++) {
            let itemButtons = this.previewItems[i];
            let itemCenter = itemButtons.offsetLeft + (itemButtons.offsetWidth / 2);
            let relativeItemPos = itemCenter / previewBarBounds.width;
            let phaseShift = relativeMousePos - relativeItemPos + .5;
            let scaleInput = Math.min(1, Math.max(0, phaseShift));
            let scale = this.SizingFunc(scaleInput);
            let translate = (this.SizingFunc(scaleInput) - 1) * 20;
            itemButtons.style.transform = `scale(${scale}) translateY(-${translate}px)`;
            itemScales.push({ itemButton: itemButtons, scale: scale });
        }
        itemScales.sort((a, b) => { return a.scale < b.scale ? -1 : a.scale > b.scale ? 1 : 0; });
        itemScales.forEach((itemScale, index) => { itemScale.itemButton.style.zIndex = index + ""; });
    }
    SizingFunc(x) {
        const scale = 1.4;
        const minValue = 1;
        // -4x^2 + 4x
        let funcValue = -4 * (x ** 2) + 4 * x;
        return Math.max(minValue, funcValue * scale);
    }
    ShowItem(itemIndex) {
        if (itemIndex < 0 || itemIndex >= this.items.length)
            throw "itemIndex must be > 0 and less than the number of items in the carousel";
        // Do nothing if the item is already shown
        if (itemIndex === this.itemIndex)
            return;
        this.previewItems[itemIndex].setAttribute("data-selected", "");
        this.leftSwitchButton.style.display = itemIndex === 0 ? "none" : "";
        this.rightSwitchButton.style.display = itemIndex === this.items.length - 1 ? "none" : "";
        if (this.itemIndex == null) {
            // No item is currently-visible, just show the new item
            this.itemContainer.appendChild(this.items[itemIndex]);
            this.itemIndex = itemIndex;
            return;
        }
        this.previewItems[this.itemIndex].removeAttribute("data-selected");
        let itemContainerWidth = this.itemContainer.offsetWidth;
        let oldItem = this.items[this.itemIndex];
        oldItem.style.position = "absolute";
        let newItem = this.items[itemIndex];
        newItem.style.visibility = "hidden";
        this.itemContainer.appendChild(newItem);
        let fromLeft = itemIndex < this.itemIndex;
        let newItemWidth = newItem.offsetWidth;
        newItem.style.display = "none";
        newItem.offsetWidth;
        let newItemInitialTranslate = (itemContainerWidth / 2) + (newItemWidth / 2);
        if (fromLeft)
            newItemInitialTranslate *= -1;
        newItem.style.transform = `translateX(${newItemInitialTranslate}px)`;
        newItem.style.visibility = "";
        newItem.style.display = "";
        let oldItemWidth = oldItem.offsetWidth;
        let oldItemFinalTranslate = itemContainerWidth / 2 + (oldItemWidth / 2);
        if (fromLeft)
            oldItemFinalTranslate *= -1;
        oldItem.style.transform = `translateX(${-oldItemFinalTranslate}px)`;
        newItem.style.transform = "none";
        newItem.removeAttribute("data-slidingout");
        oldItem.setAttribute("data-slidingout", "");
        this.itemIndex = itemIndex;
    }
    SwitchLeft() {
        if (this.itemIndex === 0)
            return;
        this.ShowItem(this.itemIndex - 1);
    }
    SwitchRight() {
        if (this.itemIndex === this.items.length - 1)
            return;
        this.ShowItem(this.itemIndex + 1);
    }
}
//# sourceMappingURL=Carousel.js.map