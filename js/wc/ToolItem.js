import { WCBase, props } from "./WCBase";

const 
template = document.createElement("template");
template.innerHTML =
`<div  class="tool-item">
</div>`;

class ToolItem extends WCBase
{
    constructor(title, width = "")
    {
        super();
        this.attachShadow({mode : "open"});
        
        this._title = title;
        this._width = width.length ? width : "auto";

        
        const css = 
        `div {
            display: flex;
            width:  ${this._width};
            height: 100%;
            color: ${props.color};
            background-color: ${props.bg};
            align-items: center;
            justify-content: center;
        }`;

        this.setupStyle(css);
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        const div = this.shadowRoot.querySelector("div");

        if (title.length)
        {
            div.innerHTML = title;
        }
    }

    addClickCallback(cb)
    {
        this.div.addEventListener("click", e => cb());
    }

    static get observedAttributes()
    {
        return ["disabled"];
    }

    get disabled()
    {
        return this.hasAttribute("disabled");
    }

    set disabled(value)
    {
        if (value)
            this.setAttribute("disabled", "");
        else
            this.removeAttribute("disabled");
    }

    get title()
    {
        return this._title;
    }

}

window.customElements.define('tool-item', ToolItem);

export { ToolItem }