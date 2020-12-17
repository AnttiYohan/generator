import
{
    newTag,
    newTagId,
    newTagHTML,
    newTagClass,
    newTagIdHTML,
    newTagIdClass,
    newTagClassHTML,
    newTagIdClassHTML,
    inputClassName,
    deleteChildren
}
from "./elemfactory";

class TableView
{
    constructor(api, table, parent)
    {
        this._api        = api;
        this._title      = table;
        this._table      = table;
        this._parent     = parent;
        this._container  = null;
        this._elemH4     = null;
        this._elemFieldTable = null;
        this._elemConstraintTable = null;
        this._newFieldCb = null;
        this._deleteFieldCb = null;
        this._newConstraintCb = null;
        this._deleteConstraintCb = null;
        this.fieldList = [];
        this.consraintList = [];
    }

    // ----------------------
    // Accessor methods
    // ----------------------
    get api()
    {
        return this._api;
    }

    set api(value)
    {
        this._table = api;
    }

    get title()
    {
        return this._title;
    }

    set title(value)
    {
        this._title = value;
    }

    get parent()
    {
        return this._parent; 
    }

    set parent(obj)
    {
        this._parent = obj;
    }

    addField(item)
    {
        this.fieldList.push(item);
    }

    clearFields()
    {
        this.fieldList = [];
    }

    loadField(list)
    {
        this.clearItems();
        for (item of list)
            this.addItem(item);
    }

    field(index)
    {
        return this.fieldList(index);
    }
    // ---------------------------------------
    // - Dynamic HTMLElement Generator Methods
    // ---------------------------------------

    setFieldCbs(newCb, deleteCb)
    {
        this._newFieldCb = newCb;
        this._deleteFieldCb = deleteCb;
    }

    setConstraintCbs(newCb, deleteCb)
    {
        this._newConstraintCb = newCb;
        this._deleteConstraintCb = deleteCb;
    }

    attachTo(root)
    {
        this._parent = root;
        this.render();
    }

    render()
    {
        this._parent.appendChild(this._container);
    }

    build()
    {
        this._container = newTagClass("div", "table-card");
        this._elemH4 = newTagClassHTML("h4", "title", this._title);
        this._elemFieldTable = newTagIdClass("table", "table-field", "detail");
        this._elemFieldTable.appendChild(TableView.createFieldHead());
        this._elemFieldTable.appendChild(TableView.createFieldBody());
        this._elemConstraintTable = newTagIdClass("table", "table-constraint", "detail");
        this._elemConstraintTable.appendChild(TableView.createConstraintHead());
        this._elemConstraintTable.appendChild(TableView.createConstraintBody());
        this._container.appendChild(this._elemH4);
        this._container.appendChild(this._elemFieldTable);
        this._container.appendChild(this._elemConstraintTable); 
    }

    static createFieldHead()
    {
        const 
        btnNew = newTagClassHTML("button", "btn-create", "new");
        btnNew.addEventListener("click", () => { this._newFieldCb(); });
        const 
        thNew  = newTagClass("th", "btn-col");
        thNew.appendChild(btnNew);
        
        const 
        tr = newTagClass("tr", "row");        
        tr.appendChild(newTagHTML("th", "name"));
        tr.appendChild(newTagHTML("th", "type"));
        tr.appendChild(newTagHTML("th", "constraint"));
        tr.appendChild(thAdd);

        const 
        thead = newTagId("thead", "thead-field");
        thead.appendChild(tr);

        return thead;
    }

    static createConstraintHead()
    {
        const 
        btnNew = newTagClassHTML("button", "btn-create", "new");
        btnNew.addEventListener("click", () => { this._newConstraintCb(); });
        const 
        thNew  = newTagClass("th", "btn-col");
        thNew.appendChild(btnNew);
        
        const 
        tr = newTagClass("tr", "row");        
        tr.appendChild(newTagHTML("th", "constraint"));
        tr.appendChild(newTagHTML("th", "type"));
        tr.appendChild(newTagHTML("th", "rules"));
        tr.appendChild(thAdd);

        const 
        thead = newTagId("thead", "thead-field");
        thead.appendChild(tr);

        return thead;
    }

    static createFieldBody()
    {
        const tbody = newTagId("tbody", "tbody-field");

        for (const field of this.fieldList)
        {
            const 
            deleteBtn = newTagClassHTML("button", "btn-delete", "x");
            deleteBtn.addEventListener("click", () => { this._deleteFieldCb(field.key); });

            const deleteTd  = newTag("td");
            deleteTd.appendChild(deleteBtn);

            const 
            tr = newTagClass("tr", "row");
            tr.appendChild(newTagHTML("td", field.key));
            tr.appendChild(newTagHTML("td", field.type));
            tr.appendChild(newTagHTML("td", field.constraint));
            tr.appendChild(deleteTd);
    
            tbody.appendChild(tr);
        }

        return tbody;
    }

    static createConstraintBody()
    {
        const tbody = newTagId("tbody", "tbody-constraint");

        for (const constraint of this.constraintList)
        {
            const 
            deleteBtn = newTagClassHTML("button", "btn-delete", "x");
            deleteBtn.addEventListener("click", () => { this._deleteConstraintCb(constraint.title); });

            const deleteTd  = newTag("td");
            deleteTd.appendChild(deleteBtn);

            const 
            tr = newTagClass("tr", "row");
            tr.appendChild(newTagHTML("td", constraint.title));
            tr.appendChild(newTagHTML("td", constraint.target));
            tr.appendChild(newTagHTML("td", "rules"));
            tr.appendChild(deleteTd);
    
            tbody.appendChild(tr);
        }

        return tbody;
    }

    static createDataRow(data)
    {   
        const 
        btn = createButton("btn-delete");
        btn.addEventListener("click", () => {
            tr.remove();
        })
    
        const 
        td = document.createElement("TD");
        td.setAttribute("class", "btn-col");
        td.appendChild(btn);
    
        const 
        tr = document.createElement("TR");
        tr.setAttribute("class", "row");
        for (const text of data)
        {
            tr.appendChild(createTdText(text));
        }    
        tr.appendChild(td);
    
        return tr;
    }

    /**
     * Creates an table body row with inputs.
     * User may create a new static row from this by
     * clicking the button element.
     * First three TDs are populated with a string from 'data'
     * The fourth one houses a button element.
     * Button element gets a click listener with a callback
     * which removes this row
     * 
     * @param  {array}      data 
     * @return {DOMElement} tr 
     */
    static createEditorRow(data)
    {
        const values = [];    
        const 
        tr = document.createElement("TR");
        tr.setAttribute("class", "row");

        for (const text of data)
        {   
            let td = createTdInput(text);
            values.push(td.firstElementChild.value);
            tr.appendChild(td);
        }
        
        const 
        btn = createButton("btn-delete");
        btn.addEventListener("click", () => 
        {
            if (isValidDataRowParam(values))
            {
                console.log("VALUES: " + values);
                tr.remove();
                tbody.appendChild(createDataRow(values));
            }

        })

        const 
        td = document.createElement("TD");
        td.setAttribute("class", "btn-col");
        td.appendChild(btn);
        tr.appendChild(td);

        return tr;
    }
    // ---------------------------------------
    // - Static HTMLElement Generator Methods
    // ---------------------------------------

   
}

export { TableView }