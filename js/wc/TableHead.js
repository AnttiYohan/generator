import { WCBase, props } from "./WCBase";

const 
template = document.createElement("template");
template.innerHTML =
`<tr>
  <th></th>
  <th></th>
  <th></th>
  <th></th>
  <th><button></button></th>
</tr>`;

class TableHead extends WCBase
{
    constructor(thList, eventId)
    {
        super();
        
        // -----------------------------------------------
        // - Setup member properties
        // -----------------------------------------------
       
        this._eventId = eventId;
        // -----------------------------------------------
        // - Setup ShadowDOM: set stylesheet and content
        // - from template 
        // -----------------------------------------------
        this.attachShadow({mode : "open"});
        this.setupStyle
        (`
        tr {
            height: ${props.lineHeight};
        }
        
        th {
            color: ${props.editorColor};
        }

        button {
            color: ${props.editorButtonColor};
            background-color: ${props.editorButtonBg};
            width: ${props.lineHeight};
            border-top: 2px solid ${props.editorButtonBorderGlare};
            border-right: 2px solid ${props.editorButtonBorderGlare};
            border-bottom: 2px solid ${props.editorButtonBorderShade};
            border-left: 2px solid ${props.editorButtonBorderShade};
        }`);

        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // ------------
        // - Save element references
        // ------------------

        this._tr  = this.shadowRoot.querySelector("tr");
        this._btn = this.shadowRoot.querySelector("button");

        if (thList.length === 4)
        {
            for (let iter = 0; iter < 4; iter++)
            {
                this._tr.children[iter].innerHTML = thList[iter];
            }
        }
       
        this._btn.innerHTML = "new";
    }

    setupInternalRouting()
    {
        const eventId = this._eventId;
        this._btn.addEventListener("click", () => {
        
            this.dispatchEvent( new Event(eventId));

        });
    }

    connectedCallback()
    {
        this.setupInternalRouting();
    }

    disconnectedCallback()
    {
        this._btn.removeEventListener();
    }  
}

window.customElements.define('table-head', TableHead);

export { TableHead }