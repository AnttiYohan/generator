import { WCBase, props } from "./WCBase";

const 
template = document.createElement("template");
template.innerHTML =
`<div id="root" class="heading__button container-3d">
   <div class="face  front">
   
   </div>
   <div class="face   back"></div>
   <div class="face   left"></div>
   <div class="face  right"></div>
   <div class="face    top">
   
   </div>
   <div class="face bottom"></div>        
 </div>`;

class EditableField extends WCBase
{
    /**
     * 
     * @param {string} title 
     * @param {object} dimensions 
     */
    constructor(content, eventId, options)
    {
        super(content);
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
        `;

        this.setupStyle(css);
        this.shadowRoot.appendChild(template.content.cloneNode(true));

        this._root  = this.shadowRoot.getElementById("root");
        this._front = this.shadowRoot.querySelector("div.front");
        this._top   = this.shadowRoot.querySelector("div.top");
       
        //this.setContent(title);

        if (this._editable) this.setEditMode();
    }


    // - Implement this in exteded classed
    setupInput(elem)
    {
        this._top.appendChild(elem);
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
        this._front.innerHTML = content;
    }


    get content()
    {
       return '';
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

    setEditMode()
    {
        this._root.classList.add('editable');
    }

    setStaticMode()
    {
        //this.setContent(this._input.value);
        this._root.classList.remove('editable');
        this.setContent(this.content);
    }


}



export { EditableField }