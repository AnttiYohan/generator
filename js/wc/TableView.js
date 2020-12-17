
import 
{ 
    deleteChildren, 
    newTag, 
    newTagHTML, 
    newTagClass, 
    newTagChild,
    newTagChildren,
    newTagClassHTML,
    newTagClassChild,
    newTagIdChildren,
    newTagClassChildren,
    newTagClassHTMLChild,
    newTagClassHTMLChildren,
    newTagId,
    inputClassValue,
    inputClassName,
    selectClassIdOptionList,
    numberInputMinMaxDefault,
    checkboxClass
}
from "./elemfactory";

import { WCBase, props }             from "./WCBase";
import { FieldRow }           from "./FieldRow";
import { ConstraintRow, Constraint } from "./ConstraintRow";
import { PrimaryKey } from "../dbelems/Api";

const 
template = document.createElement("template");
template.innerHTML =
`<div id="table-editor-container">
    <h4 id="table-editor-title"></h4>
    <table id="table-fields">
      <thead id="thead-fields"></thead>
      <tbody id="tbody-fields"></tbody> 
    </table>
    <table id="table-constraints">
      <caption></caption>
      <thead id="thead-constraints"></thead>
      <tbody id="tbody-constraints"></tbody>
    </table>
</div>`;

class TableView extends WCBase
{
    /**
     * Generates all html, events and internal data structs
     * 
     * @param {Table} table
     */
    constructor(table = {})
    {
        super();
        
        // -----------------------------------------------
        // - Setup member properties
        // -----------------------------------------------
        this._apiTitle  = "";
        this._title     = "";
        this._currentTable = null;
        this._fieldList = [];
        this._constraintList = [];
        this._constraintMap  = {};
        this._fieldEditMode      = false;
        this._constraintEditMode = false;

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

        #table-editor-container {
            background-color: ${props.editorTableBg};
            width: ${props.editorWidth};
            height: ${props.editorHeight};
        }
    
        h4 {
            background-color: ${props.editorTitleBg};
            color: ${props.editorColor};
            height: ${props.lineHeight};
            box-shadow: 0px 2px 1px 3px rgba(${props.editorShade}, 0.33);
        }

        table {
            width: 100%;
            border-bottom: 1px solid ${props.editorBorder};
        }

        tr {
            min-height: ${props.lineHeight};
            margin: auto;
        }

        tr.edit-mode {
            min-height: ${props.lineHeight};
            background: rgb(54,0,32);
            background: -moz-linear-gradient(0deg, rgba(54,0,32,1) 0%, rgba(152,0,88,1) 10%, rgba(210,24,120,1) 90%, rgba(248,226,232,1) 100%);
            background: -webkit-linear-gradient(0deg, rgba(54,0,32,1) 0%, rgba(152,0,88,1) 10%, rgba(210,24,120,1) 90%, rgba(248,226,232,1) 100%);
            background: linear-gradient(0deg, rgba(54,0,32,1) 0%, rgba(152,0,88,1) 10%, rgba(210,24,120,1) 90%, rgba(248,226,232,1) 100%);
            filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#360020",endColorstr="#f8e2e8",GradientType=1);
            box-shadow: 0 0 5px 1px #000;
        }

        tr:hover {
            min-height: ${props.lineHeight};
            background: ${props.editorTableHoverBg};
        }

        th {
            color: ${props.editorColor};
            //width: ${props.editorColumnWidth};
        }        
        
        td {
            color: ${props.editorColor};
            //width: ${props.editorColumnWidth};
        }

        .field__name {
            width: 30%;
        }

        .field__type {
            width: 15%;
        }

        .field__size {
            width: 5%;
        }

        .field__notnull {
            width: 10%;
        }

        .field__default {
            width: 10%;
        }

        .field__constraint {
            width: 25%;
        }

        .table__button, 
        .field__button,
        .constraint__button {
            width: ${props.lineHeight};
        }

        .constraint__type {
            width: 20%;
        }

        .constraint__target {
            width: 30%;
        }

        .constraint__reference {
            width: 30%;
        }

        .constraint__actions {
            width: 20%;
        }

        /* variation for Primary Key row */

        .constraint__target--pk {
            width: 100%;
        }

        .constraint__reference--pk {
            width: 0;
        }

        .constraint__actions--pk {
            width: 0;
        }    

        /* variation for Foreign Key row */

        .constraint__target--fk {
            width: 10%;
        }

        .constraint__reference--fk {
            width: 35%;
        }

        .constraint__actions--fk {
            width: 35%;
        }      


        .constraint__button--edit {
            width: 32px;
        }

        .target__top {
            display: grid;
            grid-template-columns: auto 24px;
            justify-content: start;
        }

        constraint-row {
            background: #000;
            height: 64px;
        }

        ul {
            margin: 0;
            list-style: none;
        }

        li.td-list-item {
            min-height: ${props.lineHeight};
        }

        li.constraint-item {
            min-height: ${props.lineHeight};
        }

        li.editor-item {
            display: grid;
            grid-template-columns: auto 16px;
            justify-content: start;
        }

        li.editor-item > button {
            width: 16px;
        }

        button {
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

        button:hover {
            -webkit-box-shadow: 0px 0px 10px 1px #fff;
            -moz-box-shadow: 0px 0px 10px 1px #fff;
            box-shadow: 0px 0px 10px 1px #fff;            
        }
        /*
        button {
            cursor: pointer;
            color: ${props.editorButtonColor};
            background-color: ${props.editorButtonBg};
            width: ${props.lineHeight};
            height: ${props.lineHeight};
            border-top: 2px solid ${props.editorButtonBorderGlare};
            border-right: 2px solid ${props.editorButtonBorderGlare};
            border-bottom: 2px solid ${props.editorButtonBorderShade};
            border-left: 2px solid ${props.editorButtonBorderShade};
        }

        button:hover {
            border-box: 0 0 2px 2px rgba(#ffffff, 0.33);
        }*/

        caption {
            height: ${props.lineHeight};
            color: ${props.editorColor};
        }`);

        this.shadowRoot.appendChild(template.content.cloneNode(true));

        // ------------
        // - Save element references
        // ------------------

        this._container         = this.shadowRoot.getElementById("table-editor-container");
        this._titleH4           = this.shadowRoot.getElementById("table-editor-title");
        this._tableFields       = this.shadowRoot.getElementById("table-fields");
        this._tableConstraints  = this.shadowRoot.getElementById("table-constraints");
        this._tbodyFields       = this.shadowRoot.getElementById("tbody-fields");
        this._theadFields       = this.shadowRoot.getElementById("thead-fields");
        this._tbodyConstraints  = this.shadowRoot.getElementById("tbody-constraints");
        this._theadConstraints  = this.shadowRoot.getElementById("thead-constraints");
        this._tableConstraints.querySelector("caption").innerHTML = "constraints";

        // ----------------------------------------------------------------
        // - Define event listenerts to listen for TreeView's custom events
        // ----------------------------------------------------------------

        window.addEventListener("open-table", e => {
            this.openTable(e.detail);
        });

        window.addEventListener("close-table", e => {
            this.closeTable();
        });

        // ------------
        // - Build content
        // -----------
        //this.deactivate();
        this.build();

        //if (table instanceof Table) this.openTable(table);
  
    }



    /**
     * Renders the TableView with table fields and constraints.
     * This is called after a "open-table" custom event is received.
     * The Table object is in the event detail
     * 
     * @param {Table} table 
     */
    openTable(table)
    {
        this.clear();
        deleteChildren(this._tbodyFields);
        deleteChildren(this._tbodyConstraints);
        this._currentTable = table;
        this._apiTitle = table.parent;
        this._title = table.title;
        this._titleH4.innerHTML = `${table.parent}::${table.title}`;
        //this.activate();
        this.loadFieldRows(table.fieldList);
        this.loadConstraintRows(table.constraintList);
    }

    /**
     * Clears all table and constraint data from TableView
     * This is called after a "close-table" custom event is received.
     */
    closeTable()
    {
        this.clear();
        //this.deactivate();
        this._title = "";
        this._titleH4.innerHTML = "";
        deleteChildren(this._tbodyFields);
        deleteChildren(this._tbodyConstraints);
    }

    /**
     * Generates TableView's title, headers and 
     * event handling structure
     */
    build()
    {

        // --------------------------
        // - Generate Field Head
        // --------------------------
        this._theadFields.appendChild
        (
            TableView.createHead
            (
                [
                    { title: "Name",        cls: "field__name" }, 
                    { title: "Type",        cls: "field__type" }, 
                    { title: "Size",        cls: "field__size" }, 
                    { title: "Not Null",    cls: "field__notnull" }, 
                    { title: "Default",     cls: "field__default" }, 
                    { title: "Auto Inc",    cls: "field__autoinc" }
                ],
                "table__button",
                "create-field"
            )
        );

        // --------------------------
        // - Generate Constraint Head
        // --------------------------
        this._theadConstraints.appendChild
        (
            TableView.createHead
            (
                [
                    { title: "Type",      cls: "constraint__type" }, 
                    { title: "Target",    cls: "constraint__target" }, 
                    { title: "Reference", cls: "constraint__reference" }, 
                    { title: "Actions",   cls: "constraint__actions" } 
                ],
                "table__button",
                "create-constraint"
            )
        );


        // --------------------------------------------
        // - Listener for create-field custom event
        // -------------------------------------------- 
        this._tableFields.addEventListener
        (
            "create-field", 
            e => {
                if ( ! this._fieldEditMode) this.addFieldRow(null, true);
            }, 
            true
        );

        // ---------------------------------------------
        // - Listener for create-constraint custom event
        // ---------------------------------------------   
        this._tableConstraints.addEventListener
        (
            "create-constraint",
            e => {
                this.addConstraintRow(null, true);
            }, 
            true
        );

        // --------------------------------------------
        // - Add Listener for delete-field custom event
        // -------------------------------------------- 
        this._tableFields.addEventListener
        (
            "delete-field", e => 
            {
                console.log("Event delete field from " + e.target);
                console.log("Event detail: " + e.detail);
            }, 
            true
        );   

        // ------------------------------------------
        // - Add Listener for delete-constraint custom event
        // ------------------------------------------   
        this._tableConstraints.addEventListener
        (
            "delete-constraint", 
            e => {
                console.log("Event delete constraint from " + e.target);
                console.log("Event detail: " + e.detail);
            },
            true
        );

        // ---------------------------------------------------------------
        // - Listens for events that are emitted when
        // - Field editing is done
        // ---------------------------------------------------------------         
        this._tableFields.addEventListener
        (
            "solidify-field", 
            e => {
                const index = e.detail.index;
                const field = e.detail.field;

                this._fieldList[index - 1] = field;
                this._fieldEditMode        = false;

                this.updateConstraints();
                this.emitSaveFieldEvent(field);
            },
            true
        );

        // ---------------------------------------------------------------
        // - Listens for events that are emitted when
        // - Field editing is done
        // ---------------------------------------------------------------           
        this._tableConstraints.addEventListener
        (
            "solidify-constraint", 
            e => {
                const index      = e.detail.index;
                const constraint = e.detail.constraint;

                this._constraintList[index - 1] = constraint;
                this._constraintEditMode        = false;

                this.emitSaveFieldEvent(constraint);
            },
            true
        );

    }

    /**
     * Updates the field list for the constraint table editor
     */
    updateConstraints()
    {
        for (const row of this._tbodyConstraints.children)
        {
            row.updateFieldList(this._fieldList);
        }
    }

    /**
     * Adds click listeners for table editing
     */
    activate()
    {
        this._theadFields.style.display = "block";
        this._theadConstraints.style.display = "block";
    }

    /**
     * Remove TableView field/constraint editor listeners
     */
    deactivate()
    {
        this._theadFields.style.display = "none";
        this._theadConstraints.style.display = "none";
    }


    clearFields()
    {
        this._fieldList = [];
    }

    clearConstraints()
    {
        this._constraintList = [];
    }

    clear()
    {
        this.clearFields();
        this.clearConstraints();
    }

    // ------------------------------------------------------------------------------------------------------------------ //
    // -                                                                                                                - //
    // -    TableView Field/Constraint table row population methods                                                     - //
    // - * Add new Field row                                                                                            - //
    // - * Add new Constraint row                                                                                       - //
    // - * Change row to Edit Mode                                                                                      - //
    // - * Remove row                                                                                                   - //
    // - *                                                                                                              - //
    // ------------------------------------------------------------------------------------------------------------------ //

  
    removeFieldRow(index)
    {
        for (const tr of this._tbodyFields.children)
        {
            if (tr.hasOwnProperty('field-row') && tr.getAttribute('field-row') === index)
            {
                this._fieldList[index].splice(index - 1, 1);
                tr.remove();
            }
        }
    }


    /**
     * Adds a row to the field table body and
     * Adds an entry to the _fieldList dictionary
     *  
     * @param {Field}   field
     * @param {boolean} editable
     */
    addFieldRow(field = null, editable = true)
    {
        const index = this._tbodyFields.children.length + 1;

        if (field && ! editable) this._fieldList.push(field);
  
        this._fieldEditMode = editable;
        const options       = { editable: editable, width: "auto", height: props.lineHeight };

        this._tbodyFields.appendChild(new FieldRow(field, index, options));
    }

    /**
     * Adds a row to the constraint table body and
     * Adds an entry to the _constraintList array
     *  
     * @param {Constraint} constraint 
     * @param {boolean}    editable
     */
    addConstraintRow(constraint = null, editable = true)
    {
        const index = this._tbodyConstraints.children.length + 1;
        let pkFlag  = false;

        for (const constraintObject of this._constraintList)
        {
            if (constraintObject.type === 'PRIMARY KEY') pkFlag = true;
        }

        if (constraint && ! editable ) this._constraintList.push(constraint);

        this._constraintEditMode = editable;

        const options = { editable: editable, width: "auto", height: "64px" };
        this._tbodyConstraints.appendChild
        (
            new ConstraintRow(constraint, index, options, this._fieldList, pkFlag)
        );
    }

    /**
     * Generates the rows to the field table
     * 
     * @param {array} fieldList 
     */
    loadFieldRows(fieldList)
    {
        for (const key in fieldList)
        {
            this.addFieldRow(fieldList[key], false);
        }
    }

    /**
     * Generates the rows to the constraint table
     * 
     * @param {array} constraintList 
     */
    loadConstraintRows(constraintList)
    {
        for (const constraint of constraintList)
        {
            this.addConstraintRow(constraint);
        }
    }

    /**
     * Creates a tr element with th elements from the params
     * 
     * @param  {array}  headerList 
     * @param  {string} buttonClass 
     * @param  {string} eventName
     * @return {HTMLTableRowElement}
     */
    static createHead(headerList, buttonClass, eventName)
    {
        const tr = newTagClass('tr', 'table__headrow');

        const 
        createButton = newTagClass('button', buttonClass);
        createButton.addEventListener('click', e => {
            tr.dispatchEvent(new CustomEvent(eventName));
        });

        for (const header of headerList)
        {
            tr.appendChild( newTagClassHTML('th', header.cls, header.title) );
        }

        tr.appendChild( createButton );

        return tr;
    }
    // ------------------------------------------------------------------------------------------------------------------ //
    // -                                                                                                                - //
    // -    Custom Event Emitters                                                                                       - //
    // -                                                                                                                - //
    // ------------------------------------------------------------------------------------------------------------------ //

    /**
     * Emits a "save-field" event at window global bus
     * The TreeView should be listening to "save-field"
     * Events, this is the way to keep TextView and TableView
     * decoupled while transmitting data between them
     */
    emitSaveFieldEvent(field)
    {
        const msg = {
            tableTitle: this._title,
            field:      field
        };

        window.dispatchEvent(new CustomEvent("save-field", { detail: msg } ));
    }

    /**
     * Emits a "save-field" event at window global bus
     * The TreeView should be listening to "save-field"
     * Events, this is the way to keep TextView and TableView
     * decoupled while transmitting data between them
     */
    emitSaveConstraintEvent(constraint)
    {
        const msg = {
            table: this._title,
            constraint: constraint
        };

        window.dispatchEvent(new CustomEvent("save-constraint", { detail: msg } ));
    }

    /**
     * Emits a "save-field" event at window global bus
     * The TreeView should be listening to "save-field"
     * Events, this is the way to keep TextView and TableView
     * decoupled while transmitting data between them
     */
    emitRemoveFieldEvent(key)
    {
        const msg = {
            table: this._title,
            field: key
        };

        window.dispatchEvent(new CustomEvent("remove-field", { detail: msg } ));
    }

    /**
     * Emits a "save-field" event at window global bus
     * The TreeView should be listening to "save-field"
     * Events, this is the way to keep TextView and TableView
     * decoupled while transmitting data between them
     */
    emitRemoveConstraintEvent(key)
    {
        const msg = {
            table: this._title,
            constraint: key
        };

        window.dispatchEvent(new CustomEvent("remove-constraint", { detail: msg } ));
    }
    attributeChangedCallback(attr, oldValue, newValue)
    {

    }    
}

window.customElements.define('table-view', TableView);

export { TableView }