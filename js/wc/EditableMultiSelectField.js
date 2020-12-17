import { deleteChildren, newTag, newTagClass, newTagClassChildren, newTagClassHTML, selectClassIdOptionList } from "./elemfactory";
import { WCBase, props } from "./WCBase";

const 
template = document.createElement("template");
template.innerHTML =
`<div id="root" class="heading__button container-3d">
   <div class="face  front">
     <div class="front__container">
     </div>
   </div>
   <div class="face   back"></div>
   <div class="face   left"></div>
   <div class="face  right"></div>
   <div class="face    top">
     <div class="top__container">
     </div>
   </div>
   <div class="face bottom"></div>        
 </div>`;

class EditableMultiField extends WCBase
{
    /**
     * 
     * @param {string} title 
     * @param {object} dimensions 
     */
    constructor(list, eventId, options)
    {
        super('');
        this.attachShadow({mode : "open"});
        
        this._eventId  = eventId;

        let width  = "auto";
        let height = "100%";

        if ( options !== undefined )
        {
            this._editable = options.hasOwnProperty('editable') ? options.editable : false;
            width          = options.hasOwnProperty('width')    ? options.width    : "auto";
            height         = options.hasOwnProperty('height')   ? options.height   : "100%";
        }

        this._entryMap  = {};
        
        const css = 
        `.container-3d {
            display: flex;
            align-items: center;
            justify-content: center;
            perspective: 150;
            width:  ${width};
            height: ${height};
            transform-style: preserve-3d;
            transition: all .3s ease-in;
        }

        .container-3d.editable {
            transform: rotate3d(1, 0, 0, -90deg);
        }

        //.container-3d:hover {
        //    transform: scale3d(1.2, 1.2, 1.2);
        //}

        .face {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            position: absolute;
            background: rgba(255, 255, 255, 0.25);
        }

        .front {
            transform: translateZ(${props.translateUnit});
        }

        .back {
            transform: rotateY(180deg) translateZ(${props.translateUnit});
        }

        .left {
            transform: rotateY(-90deg) translateZ(${props.translateUnit});
        }

        .right {
            transform: rotateY(90deg) translateZ(${props.translateUnit});
        }

        .top {
            transform: rotateX(90deg) translateZ(${props.translateUnit});
        }

        .bottom {
            transform: rotateX(-90deg) translateZ(${props.translateUnit});
        }      

        .clickable {
            cursor: pointer;
        }

        .zoomable {
            transition: transform .15s ease-in-out;
        }

        .zoomable:hover {
            transform: scale3D(1.3, 1.3, 1.3);
        }
        
        input {
            width: 100%;
        }

        .top__container {
            display: grid;
            grid-template-columns: auto auto;
            justify-content: start;
        }

        .entry__container {
            display: grid;
            grid-auto-columns: min-content;
            justify-content: start;
            overflow-x: auto;
            overflow-y: hidden;         
        }

        .top__button--add {
            margin: 3px 0;
            width:  24px;
            height: 24px;
            background-image: url('./js/wc/img/icon_add.svg');     
        }

        .front__container {
            display: grid;
            grid-auto-columns: min-content;
            justify-content: start;
            overflow-x: auto;
            overflow-y: hidden;
        }

        .entry {
            height: ${props.lineHeight};
            display: grid;
            grid-template-columns: auto auto;
            grid-row: 1;
            margin-right: 16px;
        }

        .entry__select {
            margin: 0 8px 0 0;
        }

        .entry__presentation {
            height: ${props.lineHeight};
            margin: 0 8px 0 0;
            padding: 5px 0;
        }

        .entry__button {
            margin: 3px 0;
            width:  24px;
            height: 24px;
            background-image: url('./js/wc/img/icon_cancel.svg'); 
        }

        `;

        this.setupStyle(css);
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this._root  = this.shadowRoot.getElementById("root");
        this._frontContainer  = this.shadowRoot.querySelector("div.front__container");
        this._topContainer    = this.shadowRoot.querySelector("div.top__container");

        this.createTop(list);
        if (this._editable) this.setEditMode();
    }


    /**
     * Creates the front panel of the element
     */
    createFront()
    {
        deleteChildren(this._frontContainer);

        for (const item of this.content)
        {
            const entry = newTagClass('div', 'entry');
            entry.appendChild(newTagClassHTML('p', 'entry__presentation', item));
            this._frontContainer.appendChild(entry);
        }
    }

    /**
     * Creates the top panel of the element
     * 
     * @param {array} list The dropdown list 
     */
    createTop(list)
    {
        deleteChildren(this._topContainer);

        const entryContainer = newTagClass('div', 'entry__container');

        for (const item of this.content)
        {
            entryContainer.appendChild(this.createEntry(item));
        }

        const targetSelect = selectClassIdOptionList('entry__select', null, list);
        targetSelect.addEventListener("change", e => {

            const option = e.target.value;

            console.log(`Selected ${option}`);
            if ( ! this._entryMap.hasOwnProperty(option))
            {
                this._entryMap[option] = true;
                entryContainer.appendChild(this.createEntry(option));
            }


        });

        this._topContainer.appendChild(targetSelect);
        this._topContainer.appendChild(entryContainer);
    }

    /**
     * Creates an entry to the edit mode
     * 
     * @param  {string}         title The entry title
     * @return {HTMLDivElement} The Entry element 
     */
    createEntry(title)
    {
        const 
        removeButton = newTagClass('div', 'entry__button zoomable');

        const entry = newTagClass('div', 'entry');
        entry.setAttribute('target-field', title);
        entry.appendChild(newTagClassHTML('p', 'entry__presentation', title));
        entry.appendChild(removeButton);

        removeButton.addEventListener("click", e => {
            delete this._entryMap[title];
            entry.remove();
        });

        return entry;
    }

    // ------------------------------------------
    // - Override these methods in child classes
    // - setupInput(): create the input element and attach it to the top div
    // - setContent(): extend in child class, call base method and set content to the input element
    // - inputValue(): return the input elements value
    // ---------------------------------------
    setContent(content)
    {
        this._title = content;
    }


    /**
     * Returns the selected entries
     * 
     * @return {array}
     */
    get content()
    {
       const list = [];

       for (const key in this._entryMap)
       {
           list.push(key);
       }

       return list;
    }

    // --------------------------------
    // Accessor methods
    // ---------------------------------
    get editable()
    {
        return this.hasAttribute('editable');
    }

    set editable(value)
    {
        if (value)
        {
            this.setAttribute('editable', '');
        }
        else
        {
            this.removeAttribute('editable');
        }
    }

    static get observedAttributes()
    {
        console.log("EditableField::observedAttributes called");
        return ['disabled', 'editable'];
    }

    attributeChangedCallback(name, oldValue, newValue)
    {
        console.log(`Attribute ${name} (${oldValue}) changed to ${newValue}`);
    }

    setEditMode(list = [])
    {
        if (list.length)
        {
            this.createTop(list);
        }
        this._root.classList.add('editable');
    }

    setStaticMode()
    {
        //this.setContent(this._input.value);
        this._root.classList.remove('editable');
        this.createFront();
    }





}

window.customElements.define( 'editable-multi-field', EditableMultiField );

export { EditableMultiField }