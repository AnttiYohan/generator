import { deleteChildren } from "./elemfactory";
import { WCBase, template, props } from "./WCBase";


template.innerHTML =
`<tr>
  <td><input type="text" id="input-name"></input></td>
  <td>
    <select name="field-type" id="field-type">
      <option value="BIT">BIT</option>
      <option value="BLOB">BLOB</option>
      <option value="CLOB">CLOB</option>
      <option value="CHAR">CHAR</option>
      <option value="TEXT">TEXT</option>
      <option value="FLOAT">FLOAT</option>
      <option value="BINARY">BINARY</option>
      <option value="DECIMAL">DECIMAL</option>
      <option value="DOUBLE">DOUBLE</option>
      <option value="INTEGER">INTEGER</option>
      <option value="VARCHAR">VARCHAR</option>
      <option value="BOOLEAN">BOOLEAN</option>
      <option value="LONGTEXT">LONGTEXT</option>
      <option value="VARBINARY">VARBINARY</option>
      <option value="MEDIUMTEXT">MEDIUMTEXT</option>
    </select>
  </td>
  <td><input min="0" max="8192" default="0" type="number" id="input-size"></input></td>
  <td>
    <select name="field-constraint" id="field-constraint">
      <option value="NONE">NONE</option>
      <option value="CHECK">CHECK</option>
      <option value="INDEX">INDEX</option>
      <option value="UNIQUE">UNIQUE</option>
      <option value="DEFAULT">DEFAULT</option>
      <option value="NOT NULL">NOT NULL</option>
      <option value="PRIMARY KEY">PRIMARY KEY</option>
      <option value="FOREIGN KEY">FOREIGN KEY</option>
      <option value="AUTO INCREMENT">AUTO INCREMENT</option>
    </select>
  </td>
  <td class="btn-col"><button class="btn-done"></button></td>
</tr>`;

class TableFieldEntry extends WCBase
{
    constructor(doneCallback)
    {
        super();
        
        // -----------------------------------------------
        // - Setup member properties
        // -----------------------------------------------
        this._doneCallback = doneCallback;

        // -----------------------------------------------
        // - Setup ShadowDOM: set stylesheet and content
        // - from template 
        // -----------------------------------------------
        this.attachShadow({mode : "open"});
        this.setupStyle
        (`
        input[type="text"], input[type="number"] {
            height: ${props.lineHeight};
            background-color: ${props.editorInputBg};
            color: ${props.editorInputColor};
            border-radius: 5px;
            border-left: 1px solid rgba(${props.editorButtonBorderShade}, 0.5);
            border-bottom: 1px solid rgba(${props.editorButtonBorderShade}, 0.5);
            border-left: 1px solid rgba(${props.editorButtonBorderGlare}, 0.5);
            border-bottom: 1px solid rgba(${props.editorButtonBorderGlare}, 0.5);
        }
        
        select {
            height: ${props.lineHeight};
            background-color: ${props.editorInputBg};
            color: ${props.editorInputColor};
            border-radius: 5px;
            border-left: 1px solid rgba(${props.editorButtonBorderGlare}, 0.5);
            border-bottom: 1px solid rgba(${props.editorButtonBorderGlare}, 0.5);
            border-left: 1px solid rgba(${props.editorButtonBorderShade}, 0.5);
            border-bottom: 1px solid rgba(${props.editorButtonBorderShade}, 0.5);
            box-shadow: -1px 1px 2px 1px rgba(${props.editorShade}, 0.33);
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

        this._tr        = this.shadowRoot.querySelector("tr");
        this._inputName = this.shadowRoot.getElementById("input-name");
        this._btn       = this.shadowRoot.getElementById("btn-done");
       
        this._btn.innerHTML = ">";
    }

    set doneCallback(fn)
    {
        this._doneCallback = fn;
    }

    setupInternalRouting()
    {
        this._btn.addEventListener("click", () => {
            this._doneCallback(this._inputName.value.length);
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

window.customElements.define('table-field-entry', TableFieldEntry);

export { TableFieldEntry }