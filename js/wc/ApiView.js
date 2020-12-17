/*****************
 * The ApiView is a TreeView with one Api schema, from which branches
 * Tables
 * Models
 * Utility items, like:
 * Statistics
 * Settings
 * 
 * ----------------------
 * -  WeatherAPI        -
 * ----------------------
 * - table 1            -
 * - table 2            -
 * - ...                -
 * - table N            -
 * ----------------------
 * - model 1            -
 * - ...                -
 * - model N            -
 * ----------------------
 * - Stats              -
 * ----------------------
 * - Settings           -
 * ----------------------
 * 
 * Clicking the items emit custom events that other components are able to catch,
 * For example a table item emits open-table events, that opens the table view,
 * Models emit open-model events, that open the model view,
 * ApiView listens to events, such as add-field event, which adds a field to a table
 * -------------
 * Exhastive list of events:
 * 
 * For more information, check out the technical documentation of the projct from the /document 
 */

import { Api, Table } from "../dbelems/Api";
//import * from "./elemfactory";
import { deleteChildren, inputClassId, newTagClass, newTagIdClassChildren, newTagClassHTML, newTagIdClassHTMLChildren, newTagIdClass, newTagAttrs, newTagAttrsChildList, newTagAttrsChildren, newTagClassAttrs } from "./elemfactory";
import { WCBase, props } from "./WCBase";
import { Store } from "../LocalStorageManager";
import { ApigenRequest } from "../ApigenRequest";

const 
template = document.createElement("template");
template.innerHTML =
`<div id="api-view">
  <div class="heading">
    <h4 id="api-view-title" class="heading__title"></h4>
  </div>
  <div id="table-container" class="tree">
    <div id="table-heading" class="tree__heading">
      <div id="table-expander" class="tree__expander zoomable"></div>
      <p class="tree__title">Table</p>
      <div id="add-table-button" class="tree__button zoomable"></div>
    </div>
    <ul id="table-list" class="sublist">
    </ul>
  </div>
  <div id="model-container" class="tree">
    <div id="model-heading" class="tree__heading">
      <div id="model-expander" class="tree__expander zoomable"></div>
      <p class="tree__title">Model</p>
      <div id="add-model-button" class="tree__button zoomable"></div>
    </div>
    <ul id="model-list" class="sublist">
    </ul>
  </div>
</div>`;

/**
 * 
 * @listens save-field    emitter: 'wc/TableView.js'
 * message:
 * sql field object {Field} '/dbelems/Field.js'
 * 
 * @listens remove-field  emitter: 'wc/TableView.js'
 * message:
 * sql field key {string}
 * 
 * @emits   open-table    receiver: 'wc/TableView.js'
 * no message
 * 
 * @emits   close-table   receiver: 'wc/TableView.js'
 * transmits:
 * sql table object {Table} '/dbelems/Table.js'
 * ----------------------------------------------------
 */
class ApiView extends WCBase
{
    constructor(api = {})
    {
        super();
        
        // -----------------------------------------------
        // - Setup member properties
        // -----------------------------------------------

        this._api           = null;
        this._title         = "";
        this._user          = null;
        this._currentTable  = null;
        this._currentModel  = null;
        this._hasEntry      = false;

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

        #api-view {
            background-color: ${props.bg};
            max-width: 400px;
            min-width: 200px;
            height: 100vh;
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

        .tree__button {
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

        .tree__button.add {
            background-image: url('./js/wc/img/icon_add.svg');
        }

        .tree__button.delete {
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

        .tree__button:hover {
            -webkit-box-shadow: 0px 0px 10px 1px #fff;
            -moz-box-shadow: 0px 0px 10px 1px #fff;
            box-shadow: 0px 0px 10px 1px #fff;
        }

        .tree__button:active {
            box-shadow: 0 0 2px 2px rgba(${props.editorButtonBorderGlare}, 0.33);
        }

        .tree__heading {
            cursor: pointer;
            //height: ${props.lineHeight};
            color: ${props.color};
            border-bottom: 1px solid ${props.border};
        }

        .tree__expander {
            cursor: pointer;
            display: inline-block;
            float: left;
            margin: 4px;
            width: 24px;
            height: 24px;
            background-image: url('./js/wc/img/icon_arrow_right.svg');
        }

        .tree__expander.open {
 
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

        .heading__container {
            clear: both;
            color: ${props.color};
        }

        .heading__container:hover {
            background: #444;
        }

        .tree__title {
            cursor: pointer;
            margin: 4px 0;
            display: inline-block;
            text-align: center;
            color: ${props.color};
            height: ${props.lineHeight};
        }

        .tree__button {
            display: none;
            float: right;
            margin: 4px;
            width: 24px;
            height: 24px;
            background-image: url('./js/wc/img/icon_add.svg');
        }

        .sublist {
            display: none;
            margin-left: 36px;
        }

        .sublist__item {
            cursor: pointer;
            height: ${props.lineHeight};
        }

        .sublist__item.active {
            background-color: ${props.activeItemBg};
        }

        .sublist__item.entry {
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
        this._container   = this.shadowRoot.getElementById("tree-container");
        this._title       = this.shadowRoot.getElementById("api-view-title");
        this._tree        = this.shadowRoot.getElementById("api-view-tree");
        this._tableUl     = this.shadowRoot.getElementById("table-list");
        this._tableButton = this.shadowRoot.getElementById("add-table-button");
        this._modelUl     = this.shadowRoot.getElementById("model-list");
        this._modelButton = this.shadowRoot.getElementById("add-model-button");

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
        // - Setup the table heading functionality
        // -----------
        const tableExpander  = this.shadowRoot.getElementById("table-expander");
        const addTableButton = this.shadowRoot.getElementById("add-table-button");

        tableExpander && tableExpander.addEventListener("click", e =>
        {
            tableExpander.classList.toggle('open');

            if (tableExpander.classList.contains('open'))
            {
                this._tableUl.style.display = "block";
                this._tableButton.style.display = "block";
            }
            else
            {
                this._tableUl.style.display = "none";
                this._tableButton.style.display = "none";
            }
        });

        addTableButton && addTableButton.addEventListener("click", e =>
        {
            this.addTableEntry();
        });

        // - Load the API if was passed as param
        
        this.testCreateApi();
    }

    clear()
    {
        deleteChildren(this._ul);
        this._hasEntry = false;
        this._titleBtn.removeEventListener("click", this.btnListener);
    }

    // ----------------------------------------------------
    // -
    // - TreeView API Editor Mode Methods:
    // - * Add new API entry
    // - * Validate API entry value
    // - * Solidify API entry as an API item
    // -
    // ----------------------------------------------------


    testCreateApi()
    {
        const api = new Api
        (
            "testApi",
            [
                new Table("table1"),
                new Table("table2"),
                new Table("table3")
            ]
        ); 

        this.openApi(api);
    }

 
    /**
     * Opens the tree with an Api object
     * 
     * @param {Api} api
     */
    openApi(api)
    {
        this._api = api;
        this.setTitle(api.title);
        this.loadTableList(api.tableList);
    }

    /**
     * Sets the ApiView header
     * 
     * @param {string} title 
     */
    setTitle(title)
    {
        this._title.innerHTML = title;
    }

    /**
     * Sets the tables into ApiView
     * 
     * @param {array} tableList 
     */
    loadTableList(tableList)
    {
        if (tableList.length) 
        {
            for (const table of tableList)
            {
                this.addTable(table);
            }
        }
    }

    addTable(table)
    {
        this._tableUl.appendChild(this.createTableItem(table));
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
     * 
     * @param {Table} table 
     */
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
     * Add a Table Entry input to table ul
     * 
     */
    addTableEntry()
    {
        this._hasEntry = true;
        const li     = newTagClass("li", "tree-table-item entry");

        const 
        input  = inputClassId("entry", "item-input");
        input.addEventListener("keyup", ({key}) => {
            if (key === "Enter") this.validateTableTitle(li, input.value);
        })

        const 
        btnOk  = newTagClassHTML("button", "tool-item", "ok");
        btnOk.addEventListener("click", e => {
            this.validateTableTitle(li, input.value);
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

        this._tableUl.appendChild(li);
    }

    /**
     * Validates a Table Entry input
     * 
     * @param {Api}           api
     * @param {HTMLLIElement} li 
     * @param {string}        title 
     */
    validateTableTitle(li, title)
    {
        if (title.length > 0)
        {
            this._hasEntry = false;
            this.solidifyAsNewTable(li, title);
        }
    }

    /**
     * Changes a Table Entry to a solid Table Item
     * 
     * @param {Api}
     * @param {HTMLLIElement} li 
     * @param {string}        title 
     */
    solidifyAsNewTable(li, title)
    {
        // Delete the input entry and the buttons from the list element
        deleteChildren(li);

        // Set the tree-table-item class to the table item
        // and add the input value as the inner text
        li.setAttribute("class", "tree-table-item");
        li.innerHTML = title;

        // Create a new Table object and push it to the container
        const table  = new Table(title);
        table.parent = this.api.title;

        this.api.addTable(table);

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
    
        const tableTitle = fieldInfo.tableTitle;
        const field      = fieldInfo.field;

        console.log("TreeView.createNewField: target table " + tableTitle);
        console.log("Field obj: " + field);
        
        if (this.addFieldToTable(tableTitle, field))
        {
            console.log(`Field ${field.title} added to table ${tableTitle}`);
        }
        else
        {
            console.log(`Field ${field.title} was not added to table ${tableTitle}`);
        }

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
     * Adds a field to a certain table
     * 
     * @param  {string}  tableTitle 
     * @param  {Field}   field
     * @return {boolean} 
     */
    addFieldToTable(tableTitle, field)
    {
        let   result = false;
        const table = this._api.getTable(tableTitle);

        if (table)
        {
            result = table.addField(field, true);
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
        if (table instanceof Table) window.dispatchEvent(new CustomEvent("open-table", { detail: table } ));
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

    /**
     * Emits a "close-table" event at window global bus
     * The TableView should be listening to "close-table"
     * Events, this is the way to keep TextView and TableView
     * decoupled while transmitting data between them
     */
    emitCloseModelEvent()
    {
        window.dispatchEvent(new CustomEvent("close-model", { detail: "-" } ));
    }     
}

window.customElements.define('api-view', ApiView);

export { ApiView }