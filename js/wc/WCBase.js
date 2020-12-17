const template = document.createElement("template");

class WCBase extends HTMLElement
{
    constructor(title = "")
    {
        super();

        this._title = title;
    }

    setupStyle(css)
    {
        const style = document.createElement("style");
        style.textContent = css;
        this.shadowRoot.appendChild(style);
    }

    static get observedAttributes()
    {
        console.log("EditableField::connected callback called");
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

    set title(value)
    {
        this._title = value;
    }

    connectedCallback()
    {
        console.log("EditableField::callback connected");
    }

    disconnectedCallback()
    {
        console.log("EditableField::callback connected");
    }  
}

const props = 
{
    bg: "#212128",
    color: "#f1f1f8",
    border: "#888",
    lineHeight: "32px",
    translateUnit: "16px",
    inputBg: "#787882",
    inputColor: "#f2f2f8",
    inputBorderGlare: "#c8c2d2",
    inputBorderShade: "#484858",
    buttonBg: "#232328",
    buttonColor: "#e8e8f2",
    buttonBorderShade: "#626268",
    buttonBorderGlare: "#b2b2b8",
    buttonHoverBg: "#383842",
    editorWidth: "80vw",
    editorHeight: "100%",
    editorButtonBg: "#320018",
    editorButtonColor: "#f2d8e8",
    editorButtonBorderGlare: "#d298b8",
    editorButtonBorderShade: "#560038",
    editorColumnWidth: "150px",
    editorTitleBg: "#600038",
    editorTableHoverBg: "#980068",
    editorTableBg: "#900058",
    editorBorder: "#ff0086",
    editorColor: "#f2f2f2",
    editorShade: "#120018",
    editorInputBg: "#f8c8e8",
    editorInputColor: "#222",
    activeItemBg: "#383842",
    loginFormBgStop1: "#889",
    loginFormBgStop2: "#334",
    loginFormBgStop3: "#aac",
    loginFormBgStop4: "#446",
    loginFormColor: "#eef",
    loginFormBorder: "#121218",
    loginFormButtonBgStop1: "#2312c8",
    loginFormButtonBgStop2: "#231278",
    loginFormButtonBorderStop1: "#a878ff",
    loginFormButtonBorderStop2: "#342278",
    loginFormButtonBorderStop3: "#7852dd",
    loginFormButtonBorderStop4: "#281278",
    loginFormInputBgStop1: "#636373",
    loginFormInputBgStop2: "#9898a8",
    loginFormInputBorder: "#222",
    loginFormInputBorderActive: "#dde",
    loginFormInputHoverGlare: "fff",
    loginFormInputColor: "#ffffff"
}

export { WCBase, template, props }