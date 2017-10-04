function PageLoad()
{
	let c = new Carousel(<HTMLElement>document.querySelector(".presentationArea"));

	for (let i = 0; i < 5; i++)
	{
		let item = document.createElement("div");
		item.className = "demoItem";
		item.innerHTML = i + 1 + "";

		c.AddItem(item);
	}

	c.Show();
}