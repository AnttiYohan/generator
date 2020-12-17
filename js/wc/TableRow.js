import { deleteChildren } from "./elemfactory";
import { WCBase, props } from "./WCBase";

const 
template = document.createElement("template");
template.innerHTML =
`<tr>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
  <td></td>
</tr>`;

class TableRow extends WCBase
{
    constructor(tdList, id, index)
    {
        super();
        
        // -----------------------------------------------
        // - Setup member properties
        // -----------------------------------------------
        

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
        
        td {
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

        this._tr    = this.shadowRoot.querySelector("tr");
        this._tdKey = this._tr.querySelector("td");
        this._btn   = this.shadowRoot.querySelector("button");

        if (tdList.length === 4)
        {
            for (let iter = 0; iter < 4; iter++)
            {
                this._tr.children[iter].innerHTML = tdList[iter];
            }
        }
       
        this._btn.innerHTML = "x";
        this.setupInternalRouting(id, index);
    }


    setupInternalRouting(id, index)
    {
        const title = this._tdKey.innerHTML;
        this._btn.addEventListener("click", e => {
            this._btn.dispatchEvent( new CustomEvent("create-" + id, { detail: index}));
        });
    }

    connectedCallback()
    {
       
    }

    disconnectedCallback()
    {
        this._btn.removeEventListener();
    }   
}

window.customElements.define('table-row', TableRow);

export { TableRow }