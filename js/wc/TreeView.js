import { Api, Table } from "../dbelems/Api";
//import * from "./elemfactory";
import { deleteChildren, inputClassId, newTagClass, newTagIdClassChildren, newTagClassHTML, newTagIdClassHTMLChildren, newTagIdClass, newTagAttrs, newTagAttrsChildList, newTagAttrsChildren, newTagClassAttrs } from "./elemfactory";
import { WCBase, props } from "./WCBase";
import { Store } from "../LocalStorageManager";
import { ApigenRequest } from "../ApigenRequest";

const 
template = document.createElement("template");
template.innerHTML =
`<div id="tree-container">
  <div class="heading" id="tree-prev-container">
    <h4 id="tree-prev"></h4>
  </div>
  <div class="heading" id="tree-title-container">
    <h4 id="tree-title"></h4>
    <div id="btn-create-item" class="container-3d">
        <div class="face  front"></div>
        <div class="face   back"></div>
        <div class="face   left"></div>
        <div class="face  right"></div>
        <div class="face    top"></div>
        <div class="face bottom"></div>        
    </div>
    <!--div id="btn-create-item" class="tool-item"><img src="./js/wc/img/icon_add.svg"></img></div-->
  </div>
  <ul id="tree-list">
  </ul>
</div>`;

class TreeView extends WCBase
{
    constructor(apiContainer = {})
    {
        super();
        
        // -----------------------------------------------
        // - Setup member properties
        // -----------------------------------------------

        this._hasEntry      = false;
        this._apiContainer  = apiContainer;
        this._title         = "";
        this._prev          = "";
        this._user          = { name: "", id: 0};
        this._currentApi    = null;
        this._currentTable  = null;
        this.prevListener   = null;
        this.btnListener    = null;

        // -----------------------------------------------
        // - Setup ShadowDOM: set stylesheet and content
        // - from template 
        // -----------------------------------------------

        this.attachShadow({mode : "open"});
        this.setupStyle
        (`* {
            font-family: 'Roboto', sans-serif;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        #tree-container {
            background-color: ${props.bg};
            min-width: 200px;
            height: 80vh;
        }
        
        .container-3d {
            display: flex;
            align-items: center;
            justify-content: center;
            perspective: ${props.lineHeight * 8};
            width:  ${props.lineHeight};
            height: ${props.lineHeight};
            transform-style: preserve-3d;
            transition: all .3s ease-in;
        }

        .container-3d:hover {
            transform: rotate3d(0, 1, 1, 180deg);
        }

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
            background-image: url('./js/wc/img/icon_add.svg'); 
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

        ul {
            list-style-type: none;
        }

        .heading {
            display: grid;
            grid-template-columns: 1fr 32px; //repeat(auto-fit, minmax(32px, 1fr));
            justify-content: start;
            background-color: ${props.bg};            
            border-bottom: 1px solid ${props.border};
            height: ${props.lineHeight};
        }

        h4 {
            color: ${props.color};
            height: ${props.lineHeight};
        }

        .tool-item {
            display: inline-block;
            margin: auto;
            cursor: pointer;
            background: ${props.buttonBg};
            background: -moz-linear-gradient(225deg, rgba(152,98,130,1) 10%, rgba(96,48,48,1) 90%);
            background: -webkit-linear-gradient(225deg, rgba(152,98,130,1) 10%, rgba(96,48,48,1) 90%);
            background: linear-gradient(225deg, rgba(152,98,130,1) 10%, rgba(96,48,48,1) 90%);
            filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#986282",endColorstr="#603030",GradientType=1);
            color: ${props.buttonColor};
            width: ${props.lineHeight};
            height: ${props.lineHeight};
            /*border-top: 2px solid ${props.buttonBorderGlare};
            border-right: 2px solid ${props.buttonBorderGlare};
            border-left: 2px solid ${props.buttonBorderShade};
            border-bottom: 2px solid ${props.buttonBorderShade};*/
            border-style: solid;
            border-width: 3px;
            border-image-slice: 1;
            border-image-source: -moz-linear-gradient(45deg, rgba(231,143,176,1) 0%, rgba(24,8,14,1) 48%, rgba(214,245,247,1) 53%, rgba(52,241,252,1) 100%);
            border-image-source: -webkit-linear-gradient(45deg, rgba(231,143,176,1) 0%, rgba(24,8,14,1) 48%, rgba(214,245,247,1) 53%, rgba(52,241,252,1) 100%);
            border-image-source: linear-gradient(45deg, rgba(231,143,176,1) 0%, rgba(24,8,14,1) 48%, rgba(214,245,247,1) 53%, rgba(52,241,252,1) 100%);
            text-align: center;
            text-shadow: 0px 0px 8px #000000;
            text-decoration: none;
            
        }

        .tool-item.add {
            background-image: url('./js/wc/img/icon_add.svg');
        }

        .tool-item.delete {
            color: #ffe8e8;
            background: rgb(86,0,56);
            background: -moz-linear-gradient(45deg, rgba(86,0,56,1) 10%, rgba(152,0,86,1) 90%);
            background: -webkit-linear-gradient(45deg, rgba(86,0,56,1) 10%, rgba(152,0,86,1) 90%);
            background: linear-gradient(45deg, rgba(86,0,56,1) 10%, rgba(152,0,86,1) 90%);
            filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#560038",endColorstr="#980056",GradientType=1);
            border-style: solid;
            border-width: 3px;
            border-image-slice: 1;
            border-image-source: -moz-linear-gradient(45deg, rgba(0,56,86,1) 0%, rgba(16,16,16,1) 45%, rgba(220,207,250,1) 55%, rgba(152,0,86,1) 100%);
            border-image-source: -webkit-linear-gradient(45deg, rgba(0,56,86,1) 0%, rgba(16,16,16,1) 45%, rgba(220,207,250,1) 55%, rgba(152,0,86,1) 100%);
            border-image-source: linear-gradient(45deg, rgba(0,56,86,1) 0%, rgba(16,16,16,1) 45%, rgba(220,207,250,1) 55%, rgba(152,0,86,1) 100%);
        }

        .tool-item:hover {
            -webkit-box-shadow: 0px 0px 10px 1px #fff;
            -moz-box-shadow: 0px 0px 10px 1px #fff;
            box-shadow: 0px 0px 10px 1px #fff;
        }

        .tool-item:active {
            box-shadow: 0 0 2px 2px rgba(${props.editorButtonBorderGlare}, 0.33);
        }

        .tree-item {
            cursor: pointer;
            //height: ${props.lineHeight};
            color: ${props.color};
            border-bottom: 1px solid ${props.border};
        }

        .expand-toggle {
            cursor: pointer;
            display: inline-block;
            float: left;
            margin: 4px;
            width: 24px;
            height: 24px;
            background-image: url('./js/wc/img/icon_arrow_right.svg');
        }

        .expand-toggle.open {
 
            transform: rotate3d(0, 0, 1, 90deg); //rotate(90deg);
            /*
            cursor: pointer;
            display: inline-block;
            float: left;
            margin: 4px;
            width: 24px;
            height: 24px;
            background-image: url('./js/wc/img/icon_arrow_down.svg');
            transition: transform .15s ease-in-out;*/
        }

        .tree-api-item {
            clear: both;
            color: ${props.color};
        }

        .tree-api-item:hover {
            background: #444;
        }

        .item-title {
            cursor: pointer;
            margin: 4px 0;
            display: inline-block;
            text-align: center;
            height: ${props.lineHeight};
        }

        .new-table-button {
            display: none;
            float: right;
            margin: 4px;
            width: 24px;
            height: 24px;
            background-image: url('./js/wc/img/icon_add.svg');
        }

        .tree-table-list {
            display: none;
            margin-left: 36px;
        }

        .tree-table-item {
            cursor: pointer;
            height: ${props.lineHeight};
        }

        .tree-item.active {
            background-color: ${props.activeItemBg};
        }

        .tree-item.entry {
            line-height: ${props.lineHeight};
            display: grid;
            grid-template-columns: 1fr 32px 32px;
            justify-content: start;
        }        

        input[type=text] {
            background-color: ${props.inputBg};
            color: ${props.inputColor};
            border-top: 2px solid ${props.inputBorderShade};
            border-right: 2px solid ${props.inputBorderShade};
            border-left: 2px solid ${props.inputBorderGlare};
            border-bottom: 2px solid ${props.inputBorderGlare};
            //width: 100%;
            //height: ${props.lineHeight};
        }
       
        input[type=text]:focus {
            box-shadow: 0 0 2px 2px rgba(#fff, 0.33);
        }

        input[type=text]:active {
            border: 2px solid rgba(#fffff, 0.5);
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

        // ----------------------------------------------------------------
        // - Define event listeners to listen for TableView's custom events
        // ----------------------------------------------------------------

        window.addEventListener("save-field",   e => {
            this.createNewField(e.detail);
        });

        window.addEventListener("remove-field", e => {
            this.deleteField();
        });

        // ------------
        // - Build content
        // -----------

        this.setupApiListMode();

        this.testCreateApiItemList();
    }

    refresh()
    {
        this._titleH4.innerHTML = this._title;
    }

    clear()
    {
        deleteChildren(this._ul);
        this._hasEntry = false;
        this._itemList = [];
        this._prevH4.removeEventListener("click", this.prevListener);
        this._prevH4.classList.remove("clickable");
        this._titleBtn.removeEventListener("click", this.btnListener);
    }

    prevListener()
    {
        console.log("THIS prevListener should not fire yet");
        //this.setupApiListMode();
    }

    btnListener()
    {
        console.log("This btnListener should never fire");
    }

    setUser(user)
    {
        this._user = user;
        this._prevH4.innerText = user.username;
    }

    // ----------------------------------------------------
    // -
    // - TreeView API Editor Mode Methods:
    // - * Add new API entry
    // - * Validate API entry value
    // - * Solidify API entry as an API item
    // -
    // ----------------------------------------------------

    /**
     * Sets the TreeView into ApiList Mode
     */
    setupApiListMode()
    {
        this.emitCloseTableEvent();
        this._titleBtn.addEventListener("click", this.btnListener = e => {
            if (!this._hasEntry) this.addApiEntry();
        });
    }


    testCreateApiItemList()
    {
        const apiItemList = [
            
            new Api("FirstApi",
                [
                    new Table("table1"),
                    new Table("table2"),
                    new Table("table3")
                ]
            ),
            new Api("SecondApi",
                [
                    new Table("table1"),
                    new Table("table2"),
                    new Table("table3")
                ]
            ),
            new Api("ThirdApi",
                [
                    new Table("table1"),
                    new Table("table2"),
                    new Table("table3")
                ]
            ),                        
        ];

        for (const apiItem of apiItemList)
        {
            this.addApiItem(apiItem);
        }
    }

 
    /**
     * Adds an Api object into both
     * - the container
     * - the DOM
     * 
     * @param {Api} apiItem 
     */
    addApiItem(apiItem)
    {
        this.addApiToContainer(apiItem);
        this._ul.appendChild(this.createApiItem(apiItem));
    }

    /**
     * Creates the Api list item HTML for the TreeView
     * 
     * @param {Api} apiItem 
     */
    createApiItem(apiItem)
    {
        // Create three elemnts wo the Tree list Api item row
        // (1) Expand toggle button, toggles the visibility of Api table subitems in the tree
        // (2) title paragraph, diplays the Api name
        // (3) new table button, to create a new table subitem for the api
        const expandToggle   = newTagClass("div", "expand-toggle zoomable");
        const titleParagraph = newTagClassHTML("p", "item-title", apiItem.title);
        const newTableButton = newTagClassAttrs("div", "new-table-button zoomable", {"data-api": `"${apiItem.title}"`});

        // Create a container div to house these three elements as a row
        const itemContainer  = newTagClassChildren("div", "tree-api-item" {"data-api":`"${apiItem.title}"`}, [expandToggle, titleParagraph, newTableButton]);
     
        // Create a ul element adjacent to the item container div
        // Which houses the table subitems as list elements
        const tableUl = newTagClassAttrs("ul", "tree-table-list", {"data-api": `"${apiItem.title}"`});

        // Create listelements and populate the table ul with them
        // Add an click listener to each table list element in order to
        // open the TableView editor with the clicked table data
        for (const table of apiItem.tableList)
        {
            tableUl.appendChild(this.createTableItem(table));
        }

        // Create the outermost container for:
        // - item container (The api name and buttons(toggle, new table item))
        // - table ul (the table subitem list elements)
        const 
        listItem = newTagAttrsChildren(
            "li", 
            {"id": `li-api-${apiItem.title}`, "class": "tree-item"}, 
            [itemContainer, tableUl]
            );
        //listItem = newTagClassChildren("li", "tree-item", [itemContainer, tableUl]);
        
        // Add an click listener to the expand toggle
        // To toggle the visibility of the subitems and the new subitem button
        expandToggle.addEventListener("click", e => 
        {
            this._currentApi = apiItem;

            expandToggle.classList.toggle('open');

            if (expandToggle.classList.contains('open'))
            {
                tableUl.style.display = "block";
                newTableButton.style.display = "block";
            }
            else
            {
                tableUl.style.display = "none";
                newTableButton.style.display = "none";
            }
        });

        newTableButton.addEventListener("click", e => 
        {
            this.addTableEntry(tableUl, apiItem);
        });

        return listItem;
    }


    /**
     * Add an API Entry text input in the TreeView
     * after the new api button is clicked
     */
    addApiEntry()
    {
        this._hasEntry = true;
        const li     = newTagClass("li", "tree-item entry");

        const 
        input  = inputClassId("entry", "item-input");
        input.addEventListener("keyup", ({key}) => {
            if (key === "Enter") this.validateApiTitle(li, input.value)
        });

        const 
        btnOk  = newTagClassHTML("button", "tool-item", "ok");
        btnOk.addEventListener("click", e => {
            this.validateApiTitle(li, input.value);
        });

        const 
        btnDel = newTagClassHTML("button", "tool-item delete", "x");
        btnDel.addEventListener("click", e => {
            this._hasEntry = false;
            li.remove();
        });

        li.appendChild(input);
        li.appendChild(btnOk);
        li.appendChild(btnDel);
        this._ul.appendChild(li);
    }

    /**
     * Validate an API Entry input value
     * 
     * @param {HTMLLIElement} li 
     * @param {string}        title 
     */
    validateApiTitle(li, title)
    {
        if (title.length) // && !(title in this._apiMap))
        {
            this._hasEntry = false;
            this.solidifyAsNewApi(li, title);
        }
    }

    /**
     * Change an API Entry input into solid API List Item
     * 
     * @param {HTMLLIElement} li 
     * @param {string}        title 
     */
    solidifyAsNewApi(li, title)
    {
        li.remove();
        this.addApiItem(new Api(title));
    }


    // ----------------------------------------------------
    // -
    // - TreeView Table Editor Mode Methods:
    // - * Add new Table entry
    // - * Validate Table entry value
    // - * Solidify Table entry as an Table item
    // -
    // ----------------------------------------------------

    /**
     * Creates an LI element with API's table name in it
     * And appends it to the TreeView's UL
     * 
     * @param {string} title 
     */
    addTableItem(apiTitle, table, ul)
    {
        this.addTableToContainer(apiTitle, table);
        ul.appendChild(this.createTableItem(table));
    }

    createTableItem(table)
    {
        const 
        li = newTagClassAttrs("li", "tree-table-item", {"data-table": `"${table.title}"`}, table.title);
        li.addEventListener("click", e => {
            this.emitOpenTableEvent(table);
        });

        return li;
    }


    /**
     * Add a Table Entry input to a TreeView table ul
     * 
     * @param  {HTMLUListElement} tableUl
     * @param  {Api}              api
     */
    addTableEntry(tableUl, api)
    {
        this._hasEntry = true;
        const li     = newTagClass("li", "tree-table-item entry");

        const 
        input  = inputClassId("entry", "item-input");
        input.addEventListener("keyup", ({key}) => {
            if (key === "Enter") this.validateTableTitle(api, li, input.value);
        })

        const 
        btnOk  = newTagClassHTML("button", "tool-item", "ok");
        btnOk.addEventListener("click", e => {
            this.validateTableTitle(api, li, input.value);
        });

        const 
        btnDel = newTagClassHTML("button", "tool-item delete", "x");
        btnDel.addEventListener("click", e => {
            this._hasEntry = false;
            li.remove();
        });

        li.appendChild(input);
        li.appendChild(btnOk)
        li.appendChild(btnDel);

        tableUl.appendChild(li);

    }

    /**
     * Validates a Table Entry input
     * 
     * @param {Api}           api
     * @param {HTMLLIElement} li 
     * @param {string}        title 
     */
    validateTableTitle(api, li, title)
    {
        if (title.length > 0)
        {
            this._hasEntry = false;
            this.solidifyAsNewTable(api, li, title);
        }
    }

    /**
     * Changes a Table Entry to a solid Table Item
     * 
     * @param {Api}
     * @param {HTMLLIElement} li 
     * @param {string}        title 
     */
    solidifyAsNewTable(api, li, title)
    {
        // Delete the input entry and the buttons from the list element
        deleteChildren(li);

        // Set the tree-table-item class to the table item
        // and add the input value as the inner text
        li.setAttribute("class", "tree-table-item");
        li.innerHTML = title;

        // Create a new Table object and push it to the container
        const table = new Table(title);
        table.parent = api.title;
        this.addTableToContainer(api.title, table);

        // Add a click listener to the table subitem in order to open the TableView with it
        li.addEventListener("click", e => {
            this.emitOpenTableEvent(table);
        });        

    }

    // -------------------------------------------
    // -
    // - API Schema object manipulation methods with HTTP Requests
    // -
    // ------------------------------------------


    /**
     * Creates new field to the current api
     * @param {Field} field 
     */
    createNewField(fieldInfo)
    {
     
        const apiTitle   = fieldInfo.apiTitle;
        const tableTitle = fieldInfo.tableTitle;
        const field      = fieldInfo.field;

        console.log("TreeView.createNewField: target api " + apiTitle);
        console.log("TreeView.createNewField: target table " + tableTitle);
        console.log("Field obj: " + field);

        if (this.addFieldToContainer(apiTitle, tableTitle, field))
        {
            //this.postSchema();
        }

        //this._currentApi.tableByTitle(table).addField(field);

        const apigen = new ApigenRequest();
        Store.createApi(this._currentApi);

        const response = apigen.postSchema(this._currentApi.title, this._currentApi);

    }

    postTestToServer(userid, api)
    {
        const apigen = new ApigenRequest();
        apigen.postApiByAuthor(userid, api);
    }
   
    getSchema()
    {

    }

    postSchema()
    {
        const apigen = new ApigenRequest();
        apigen.postApiByAuthor(1, this._currentApi);
    }

   // --------------------------------------------------------
    // -
    // - Api Container accessor methods
    // -
    // -------------------------------------------------------

    /**
     * Adds an Api object to the container
     * 
     * @param {Api} apiItem 
     */
    addApiToContainer(apiItem)
    {
        let result = false;

        if ( ! this._apiContainer.hasOwnProperty(apiItem.title))
        {
            this._apiContainer[apiItem.title] = apiItem;
            result = true;
        }

        return result;
    }

    /**
     * Adds an Table object to the container
     * 
     * @param {string} apiTitle 
     * @param {Table}  tableItem 
     */
    addTableToContainer(apiTitle, table)
    {
        let result = false;
        const api  = this.getApiFromContainer(apiTitle);

        if (api)
        {
            result = api.addTable(table) 
        }

        return result;
    }

    /**
     * Adds a field to the containar
     * 
     * @param  {string}  apiTitle 
     * @param  {string}  tableTitle 
     * @param  {Field}   field
     * @return {boolean} 
     */
    addFieldToContainer(apiTitle, tableTitle, field)
    {
        let result  = false;
        const table = this.getTableFromContainer(apiTitle, tableTitle);

        if (table)
        {
            result = table.addField(field);
        }

        return result;
    }

    /**
     * Returns an Api object from the container if the key exists
     * 
     * @param  {string} apiTitle
     * @return {Api} 
     */
    getApiFromContainer(apiTitle)
    {
        let resultObj = null;

        if (this._apiContainer.hasOwnProperty(apiTitle))
        {
            resultObj = this._apiContainer[apiTitle];
        }

        return resultObj;
    }

    /**
     * Returns an Table object from the container if the keys exist
     * 
     * @param  {string} apiTitle 
     * @param  {string} tableTitle
     * @return {Table} 
     */
    getTableFromContainer(apiTitle, tableTitle)
    {
        let resultObj = null;
        const api  = this.getApiFromContainer(apiTitle);

        if (api)
        {
            resultObj = api.getTable(tableTitle);
        }

        return resultObj;
    }

    /**
     * Removes an Api object from the contaner
     * 
     * @param  {string} apiTitle
     * @return {boolean} 
     */
    removeApiFromContainer(apiTitle)
    {
        let result = false;

        if (this._apiContainer.hasOwnProperty(apiTitle))
        {
            delete this._apiContainer[apiTitle];
            result = true;
        }

        return result;
    }

    /**
     * Removes a table from the container if exists
     * 
     * @param  {string} apiTitle 
     * @param  {string} tableTitle 
     * @return {boolean}
     */
    removeTableFromContainer(apiTitle, tableTitle)
    {
        let result = false;
        const api  = this.getApiFromContainer(apiTitle);

        if (api)
        {
            result = api.removeTable(tableTitle);
        }

        return result;
    }

    // --------------------------------
    // -
    // - Custom Event Emitters
    // -
    // --------------------------------

    /**
     * Emits a "open-table" event at window global bus
     * The TableView should be listening to "open-table"
     * Events, this is the way to keep TextView and TableView
     * decoupled while transmitting data between them
     * 
     * @param {Table}
     */
    emitOpenTableEvent(table)
    {
        //const detailMsg = this._currentTable;
        window.dispatchEvent(new CustomEvent("open-table", { detail: table } ));
    }
    /**
     * Emits a "open-model" event at window global bus
     * The TableView should be listening to "open-model"
     * Events, this is the way to keep TextView and TableView
     * decoupled while transmitting data between them
     */
    emitOpenModelEvent(model)
    {
        if (model) window.dispatchEvent(new CustomEvent("open-model", { detail: model } ));
    }

    /**
     * Emits a "close-table" event at window global bus
     * The TableView should be listening to "close-table"
     * Events, this is the way to keep TextView and TableView
     * decoupled while transmitting data between them
     */
    emitCloseTableEvent()
    {
        window.dispatchEvent(new CustomEvent("close-table", { detail: "-" } ));
    } 
}

window.customElements.define('tree-view', TreeView);

export { TreeView }