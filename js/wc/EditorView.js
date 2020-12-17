import { deleteChildren } from "./elemfactory";
import { WCBase, template, props } from "./WCBase";


template.innerHTML =
`<div id="tree-container">
  <div class="heading" id="tree-prev-container">
    <h4 id="tree-prev"></h4>
  </div>
  <div class="heading" id="tree-title-container">
    <h4 id="tree-title"></h4>
    <div id="btn-create-item" class="tool-item">+</div>
  </div>
  <ul id="tree-list">
  </ul>
</div>`;

class EditorView extends WCBase
{
    constructor(title, prev = "", itemList = [], itemCallback = null)
    {
        super();
        
        // -----------------------------------------------
        // - Setup member properties
        // -----------------------------------------------
        this._hasEntry  = false;
        this._title     = title;
        this._prev      = prev;
        this._itemCallback = itemCallback;

        // -----------------------------------------------
        // - Setup ShadowDOM: set stylesheet and content
        // - from template 
        // -----------------------------------------------
        this.attachShadow({mode : "open"});
        this.setupStyle
        (`
        #tree-container {
            background-color: ${props.bg};
            min-width: 200px;
            height: 80vh;
        }
        
        .heading {
            display: grid;
            grid-template-columns: repeat(auto-fit, 32px);
            justify-content: start;
            background-color: ${props.bg};            
            border-bottom: 1px solid ${props.border};
            height: ${props.lineHeight};
        }

        h4 {
            color: ${props.color}; 
        }

        .tool-item {
            color: ${props.color};
            width: ${props.lineHeight};
            height: ${props.lineHeight};
            border: 2px solid ${props.border};
        }

        .tree-item {;
            line-height: ${props.lineHeight};
            color: ${props.color};
            border-bottom: 1px solid ${props.border};

            &.entry {
                display: grid;
                grid-template-columns: auto 32px;
                justify-content: start
            }
        }

       
        `);
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // ------------
        // - Save element references
        // ------------------

        this._container = this.shadowRoot.getElementById("tree-container");
        this._prevH4    = this.shadowRoot.getElementById("tree-prev");
        this._titleH4   = this.shadowRoot.getElementById("tree-title");
        this._titleBtn  = this.shadowRoot.getElementById("btn-create-item");
        this._ul        = this.shadowRoot.getElementById("tree-list");

        // ------------
        // - Build content
        // -----------
        this.refresh();
        this.loadItems(itemList);
    }

    refresh()
    {
        this._prevH4.innerHTML = this._prev;
        this._titleH4.innerHTML = this._title;
    }

    get title()
    {
        return this._title;
    }
    
    set title(value)
    {
        this._title = value;
    }

    get prev()
    {
        return this._prev;
    }

    set prev(value)
    {
        this._prev = prev;
    }

    set itemCallback(fn)
    {
        this._itemCallback = fn;
    }

    clearItems()
    {
        this._itemList = [];
    }

    addItem(item)
    {
        this._itemList.push(item);
        const 
        li = document.createElement("li");
        li.setAttribute("class", "tree-item");
        li.innerHTML = item;
        li.addEventListener("click", () => this._itemCallback(item));
        this._ul.appendChild(li);
    }

    solidifyAsItem(li, title)
    {
        deleteChildren(li);
        this._itemList.push(title);
        li.innerHTML = title;
        li.addEventListener("click", () => this._itemCallback(title));
    }

    addEntryAsItem()
    {
        this._hasEntry = true;
        const li = document.createElement("li");
        li.setAttribute("class", "tree-item");

        const
        input = document.createElement("input");
        input.setAttribute("class", "tree-item-entry");
        input.setAttribute("name", "item-title");
        input.setAttribute("id", "item-input");
        input.focus();

        const
        button = document.createElement("button");
        button.innerHTML = "x";
        button.addEventListener("click", () =>
        {
            this._hasEntry = false;
            if (input.value.length)
            {
                this.solidifyAsItem(li, input.value);
            }
            else
            {
                li.remove();
            }
        });

        input.addEventListener("change", () =>
        {
            if (input.value)
            {
                button.innerHTML = "ok";
            }
            else
            {
                button.innerHTML = "x";
            }
        });

        li.appendChild(input);
        li.appendChild(button);
        this._ul.appendChild(li);
    }

    loadItems(list)
    {
        this.clearItems();
        for (const item of list)
            this.addItem(item);
    }

    setupInternalRouting()
    {
        this._titleBtn.addEventListener("click", () => {
            if (!this._hasEntry) this.addEntryAsItem();
        });
    }

    connectedCallback()
    {
        this.setupInternalRouting();
    }

    disconnectedCallback()
    {
        this._titleBtn.removeEventListener();
    }

    attributeChangedCallback(attr, oldValue, newValue)
    {

    }    
}

window.customElements.define('editor-view', EditorView);

export { EditorView }