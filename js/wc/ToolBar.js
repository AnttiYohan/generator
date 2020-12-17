import { WCBase, props } from "./WCBase";

const 
template = document.createElement("template");
template.innerHTML =
`<div></div>`;

class ToolBar extends WCBase
{
    constructor(toolItemList = [])
    {
        super();
        this.attachShadow({mode : "open"});
        
        const css = 
        `div {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(${props.lineHeight}, auto));
            justify-content: start;
            border: 2px solid #888;
            height: ${props.lineHeight};
        }`;

        this.setupStyle(css);
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        const div = this.shadowRoot.querySelector("div");

        for (const toolItem of toolItemList)
        {
            div.appendChild(toolItem);
        }
    }
}

window.customElements.define('tool-bar', ToolBar);

export { ToolBar }