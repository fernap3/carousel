class Carousel
{
	private container: HTMLElement;
	private itemContainer: HTMLElement;
	private previewBar: HTMLElement;
	private items: HTMLElement[] = [];
	private previewItems: HTMLElement[] = [];
	private itemIndex: number;
	private leftSwitchButton: HTMLButtonElement;
	private rightSwitchButton: HTMLButtonElement;

	constructor(container: HTMLElement)
	{
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
		this.leftSwitchButton.onclick = (evt: MouseEvent) => { this.SwitchLeft(); };
		this.itemContainer.appendChild(this.leftSwitchButton);

		this.rightSwitchButton = document.createElement("button");
		this.rightSwitchButton.className = "switchButton rightSwitchButton";
		this.rightSwitchButton.type = "button";
		this.rightSwitchButton.onclick = (evt: MouseEvent) => { this.SwitchRight(); };
		this.itemContainer.appendChild(this.rightSwitchButton);

		document.addEventListener("mousemove", (evt: MouseEvent) => this.OnMouseMove(evt));

		// Add some items to the carousel
		for (let i = 0; i < 5; i++)
		{
			let item = document.createElement("div");
			item.className = "demoItem";
			item.innerHTML = i + 1 + "";

			// Make some GREAT looking function buttons
			let buttonsContainer = document.createElement("div");
			buttonsContainer.className = "functionButtonsContainer";
			for (let row = 0; row < 2; row++)
			{
				for (let col = 0; col < 3; col++)
				{
					var buttonNum = row * 3 + col;
					
					let button = document.createElement("button");
					button.type = "button";
					button.className = "functionButton";
					button.textContent = buttonNum + "";
					if ((row * 3 + col) % 2)
					{
						button.classList.add("functionButtonOdd");
					}

					button.onclick = (evt: MouseEvent) => {
						alert(buttonNum);
					};

					buttonsContainer.appendChild(button);
				}
			}

			item.appendChild(buttonsContainer);
			
			let itemPreviewButton = document.createElement("div");
			itemPreviewButton.className = "carouselPreviewItem";
			itemPreviewButton.style.display = "none";
			
			let itemIndex = this.items.length;
			itemPreviewButton.onclick = (evt: MouseEvent) => { this.ShowItem(itemIndex); };
			this.previewBar.appendChild(itemPreviewButton);
	
			this.previewItems.push(itemPreviewButton);
	
			let itemBox = document.createElement("div");
			itemBox.className = "carouselItem";
			itemBox.appendChild(item);
			this.items.push(itemBox);
	
			itemBox.addEventListener("transitionend", (evt: Event) => {
				if (!itemBox.hasAttribute("data-slidingout"))
					return;
	
				itemBox.remove();
				itemBox.style.position = "";
			});
		}
	}

	public Show(): void
	{
		let previewBarWidth = this.previewBar.offsetWidth;

		let keyframes: AnimationKeyFrame[] = [
			{ transform: `translateX(${previewBarWidth}px)` },
			{ transform: "none" },
		];

		let options: AnimationEffectTiming = {
			duration: 1000,
			easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
			fill: "backwards"
		};

		for (let i = 0; i < this.previewItems.length; i++)
		{
			let itemButton = this.previewItems[i];
			options.delay = 100 * i;
			itemButton.animate(keyframes, options);
			itemButton.style.display = "";
		}

		this.ShowItem(0);
	}

	private OnMouseMove(evt: MouseEvent): void
	{
		let target = <HTMLElement>evt.target;
		if (!target.closest(".carouselPreviewBar"))
		{
			for (let itemButton of this.previewItems)
				itemButton.style.transform = "";
			return;
		}
		
		let previewBarBounds = this.previewBar.getBoundingClientRect();
		let mouseX = evt.clientX - previewBarBounds.left;
		let relativeMousePos = mouseX / previewBarBounds.width;

		const inputScale = 2;

		let itemScales: {itemButton: HTMLElement, scale: number}[] = [];

		for (let i = 0; i < this.previewItems.length; i++)
		{
			let itemButtons = this.previewItems[i];
			let itemCenter = itemButtons.offsetLeft + (itemButtons.offsetWidth / 2);
			let relativeItemPos = itemCenter / previewBarBounds.width;

			let phaseShift = relativeMousePos - relativeItemPos + .5;
			let scaleInput = Math.min(1, Math.max(0, phaseShift));

			let scale = this.SizingFunc(scaleInput);
			let translate = (this.SizingFunc(scaleInput) - 1) * 20;
			itemButtons.style.transform = `scale(${scale}) translateY(-${translate}px)`;
			itemScales.push({ itemButton: itemButtons, scale: scale});
		}

		itemScales.sort((a, b) => { return a.scale < b.scale ? -1 : a.scale > b.scale ? 1 : 0; });
		itemScales.forEach((itemScale, index) => { itemScale.itemButton.style.zIndex = index + "";});
	}

	private SizingFunc(x: number): number
	{
		const scale = 1.4;
		const minValue = 1;

		// -4x^2 + 4x
		let funcValue = -4 * (x**2) + 4 * x;

		return Math.max(minValue, funcValue * scale);
	}

	private ShowItem(itemIndex: number): void
	{
		if (itemIndex < 0 || itemIndex >= this.items.length)
			throw "itemIndex must be > 0 and less than the number of items in the carousel";
		
		// Do nothing if the item is already shown
		if (itemIndex === this.itemIndex)
			return;

		this.previewItems[itemIndex].setAttribute("data-selected", "");
		this.leftSwitchButton.style.display = itemIndex === 0 ? "none" : "";
		this.rightSwitchButton.style.display = itemIndex === this.items.length - 1 ? "none" : "";

		if (this.itemIndex == null)
		{
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

	public SwitchLeft(): void
	{
		if (this.itemIndex === 0)
			return;

		this.ShowItem(this.itemIndex - 1);
	}

	public SwitchRight(): void
	{
		if (this.itemIndex === this.items.length - 1)
			return;

		this.ShowItem(this.itemIndex + 1);
	}
}