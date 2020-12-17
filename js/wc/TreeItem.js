class TreeItem extends HTMLElement
{
    constructor()
    {
        super(); 
        this.attachShadow({mode: "open"});
        const li = document.createElement("li");
        li.setAttribute("class", "tree-item");
        this.setupStyle();
        this.shadowRoot.appendChild(li);
    }

    setupStyle()
    {
        const
        style = document.createElement("style");
        style.textContent =
        `li {
            height: 32px;
        }`;
        this.shadowRoot.appendChild(style);
    }
}

customElements.define('tree-item', TreeItem);