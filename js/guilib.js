
const C =
{
    NONE           : 0,
    CHECK          : 1,    
    INDEX          : 2,
    UNIQUE         : 4,
    DEFAULT        : 8,    
    NOT_NULL       : 16,  
    PRIMARY_KEY    : 32,
    FOREIGN_KEY    : 64,
    AUTO_INCREMENT : 128    
}
const TYPE =
{
    UNDEFINED   : 0,
    BIT         : 1,   
    BLOB        : 2,         
    CLOB        : 4,
    CHAR        : 8,    
    TEXT        : 16,
    FLOAT       : 32,
    BINARY      : 64,
    DECIMAL     : 128,    
    DOUBLE      : 256,
    INTEGER     : 512,
    VARCHAR     : 1024,        
    BOOLEAN     : 2048,
    LONGTEXT    : 4096,
    VARBINARY   : 8192,   
    MEDIUMTEXT  : 16384    
}

const typeDict =
[
    "UNDEFINED",
    "BIT", 
    "BLOB",       
    "CLOB",
    "CHAR",    
    "TEXT",
    "FLOAT",
    "BINARY",
    "DECIMAL",   
    "DOUBLE",
    "INTEGER",
    "VARCHAR",
    "BOOLEAN",
    "LONGTEXT",
    "VARBINARY",
    "MEDIUMTEXT"
];

const constraintDict =
[
    "CHECK",
    "INDEX",
    "UNIQUE",
    "DEFAULT",
    "NOT NULL",
    "PRIMARY KEY",
    "FOREIGN KEY",
    "AUTO INCREMENT"
];


const apiobj =
{
    author  : null,
    db      : null,
    name    : "",
    state   : "",
    version : "",

    // ------------------------- //
    // - Methods               - //
    // ------------------------- //

    new         : function(name)
    {
        this.clear();
        this.name       = name;
        this.state      = "unsaved";
    },

    clear       : function()
    {
        this.name       = "";
        this.state      = "";
        this.author     = "";
        this.version    = "";
    },

    // ------------------------- //
    // - Property setters      - //
    // ------------------------- //

    setDB       : function(obj) { this.db      = obj; },
    setName     : function(val) { this.name    = val; },
    setAuthor   : function(val) { this.author  = val; },
    setVersion  : function(val) { this.version = val; },
}



/**
 * Database constraint
 */
class Constraint
{
    /**
     * Creates a new constraint
     * 
     * @param {string} type
     * @param {string} target 
     * @param {array}  rules 
     */
    constructor(type, target, rules)
    {
        this.type   = type;
        this.target = target;
        this.rules  = rules;
    }
}

/**
 * Database table field
 */
class Field
{
    /**
     * Creates a new field
     * 
     * @param {string} key 
     * @param {string} type 
     * @param {string} constraintType 
     */
    constructor(key, type, constraintType)
    {
        this.key        = key;
        this.type       = type;

        if (constraintType.length)
            this.constraint = new Constraint(constraintType, key, []);
        else
            this.constraint = null;
    }

    setConstraint(constraint)
    {
        this.constraint = constraint;
    }

    setRules(rules)
    {
        this.constraint.rules = rules;
    }

    name()       { return this.key;         }
    type()       { return this.type;        }
    constraint() { return this.constraint;  }
}

/**
 * Database table
 */
class Table
{
    /**
     * Creates a new table
     * 
     * @param {string} name 
     */
    constructor(name, fieldData = [], constraintData = [], pk = null)
    {
        this.name = name;
        this._pk   = pk;
        this.fieldList = {};
        this.constraintList = [];

        if (fieldData.length)
        {
            this.loadFields(fieldData);
        }

        if (constraintData.length)
        {
            this.loadConstraints(constraintData);
        }
    }

    // ----------------------------------
    // Accessor methods
    // ----------------------------------
    get title()     { return this.name; }
    set title(name) { this.name = name; }    
    get pk()        { return this._pk;  }    
    set pk(key)     { this._pk = key;   } 

    loadFields(fieldList)
    {
        for (const field of fieldList)
        {
            this.addField(field);
        }
    }

    loadConstraints(constraintList)
    {
        for (const constraint of constraintList)
        {
            this.addConstraint(constraint);
        }
    }

    /**
     * Adds a Field to the table
     * 
     * @param {Field} field 
     */
    addField(field)
    {
        this.fieldList[field.key] = field; 
    }

    /**
     * Adds a Constraint to the table
     * 
     * @param {Constraint} constraint 
     */
    addConstraint(constraint)
    {
        this.constraintList.push(constraint);
    }

    /**
     * Retrieves a Field by key
     * 
     * @param {string} key 
     */
    field(key)
    {
        return this.fieldList[key];
    }

    /**
     * Retrieves a Constraint by index
     * 
     * @param {number} index 
     */
    constraint(index)
    {
        return this.constraintList[index];
    }
}

class Api 
{
    /**
     * Creates a new Api instance
     * 
     * @param {string} name
     */
    constructor(name, tableData = [], constaintData = [])
    {
        this.name           = name;
        this.tableList      = [];
        this.modelList      = [];
    }

    loadTables(tableData)
    {
        for (const table of tableData)
        {
            this.addTable(table);
        }
    }

    /**
     * Adds a Constraint to the table
     * 
     * @param {string} type 
     * @param {string} target 
     * @param {string} constrain 
     */
    addTable(table)
    {
        this.tableList.push(table);
    }

    title()
    {
        return this.name;
    }

    getTableList() { return this.tableList; }

    getTableTitleList()
    {
        const list = [];

        for (const table of this.tableList) list.push(table.title);

        return list;
    }
}

function deleteChildren(elem)
{  
    while (elem.firstChild) elem.removeChild(elem.lastChild);
}

function createNewApiTreeView(root, okCb, itemList = [])
{
    deleteChildren(root);
    root.appendChild(createNewTreeTitle("table", okCb));
    root.appendChild(createTreeList(itemList));
}

function createApiTreeView(root, title, itemList, newTableCb)
{
    deleteChildren(root);
    root.appendChild(createTreeTitle(title, "table", newTableCb));
    root.appendChild(createTreeList(itemList));    
}

function createNewTreeTitle(targetId, okCb)
{
    const
    input = document.createElement("INPUT");
    input.setAttribute("id",    "new-api-input");    
    input.setAttribute("name",  "api-name");
    input.setAttribute("value", "");

    const
    button = document.createElement("BUTTON");
    button.setAttribute("id",   "new-api-button");
    button.setAttribute("class", "tool-item");
    button.innerHTML = "ok";

    button.addEventListener("click", () => {
        okCb(input.value);
    });
    const
    toolDiv = document.createElement("DIV");
    toolDiv.setAttribute("id",    "new-" + targetId);
    toolDiv.setAttribute("class", "tool-item disabled");
    toolDiv.innerHTML = "+";

    const 
    container = document.createElement("DIV");
    container.setAttribute("id",    "tree-title");
    container.setAttribute("class", "title-tool-tool-hbox");
    container.appendChild(input);
    container.appendChild(button);
    container.appendChild(toolDiv);

    return container;
}

function createTreeTitle(title, targetId, newCb = null)
{
    const
    h4 = document.createElement("H4");
    h4.innerHTML = title;

    const
    toolDiv = document.createElement("DIV");
    toolDiv.setAttribute("id",    "new-" + targetId);
    toolDiv.setAttribute("class", "tool-item");
    toolDiv.innerHTML = "+";

    if (newCb)
    {
        toolDiv.addEventListener("click", () =>
        {
            newCb();
        });
    }

    const 
    container = document.createElement("DIV");
    container.setAttribute("id", "tree-title");
    container.setAttribute("class", "title-tool-hbox");
    container.appendChild(h4);
    container.appendChild(toolDiv);

    return container;
}

function createTreeList(itemList)
{
    const ul = newTagIdClass("UL", "tree-root", "tree-list");

    for (const item of itemList)
    {
        ul.appendChild(createTreeItem(item));
    }

    return ul;
}

function appendTreeViewEntryItem(ul, cb)
{
    ul.appendChild(createTreeEntryItem(cb));
}

function createTreeItem(title)
{
    const p  = newTagHTML("P", title);
    const li = newTagClass("LI", "tree-item");
    li.appendChild(p);

    return li;
}

function createTreeEntryItem(cb)
{
    const 
    li = newTagClass("LI", "tree-item title-tool-hbox");

    const 
    input  = inputClassName("tree-item-input", "new-table-input");

    const 
    button = newTagClass("button", "tool-item");
    button.innerHTML = "ok";
    button.addEventListener("click", () =>
    {
        cb(li, input.value);
    });

    li.appendChild(input);
    li.appendChild(button);

    return li;
}

function solidifyTreeViewItem(li, title)
{
    deleteChildren(li);
    li.appendChild(newTagHTML("P", title));
}

function inputClassName(cls, value)
{
    const
    elem = document.createElement("INPUT");
    elem.setAttribute("type", "text");
    elem.setAttribute("class", cls);

    return elem;    
}

function newTagIdClass(tag, id, cls)
{
    const
    elem = document.createElement(tag);
    elem.setAttribute("id", id);
    elem.setAttribute("class", cls);

    return elem;
}

function newTagId(tag, id)
{
    const
    elem = document.createElement(tag);
    elem.setAttribute("id", id);

    return elem;
}

function newTagClass(tag, cls)
{
    const
    elem = document.createElement(tag);
    elem.setAttribute("class", cls);

    return elem;
}

function newTagHTML(tag, html)
{
    const elem = document.createElement(tag);
    elem.innerHTML = html;

    return elem;
}

function newTag(tag)
{
    return document.createElement(tag);
}
/**
 * Creates a tableview structure (heading and two tables),
 * with attributes and functionality passed with input parameters
 * 
 * @param  {DOMElement} root                The element to attach the structure
 * @param  {string}     title               The tableview heading
 * @param  {object}     fieldTableData      The field table parameters
 * @param  {object}     constraintTableData The constraint table parameters
 * @return {DOMElement} table 
 */
function createTableView(root, title, fieldTableData, constraintTableData)
{
    const 
    viewTitle     = document.createElement("H4");
    viewTitle.setAttribute("class", "title");
    viewTitle.innerHTML = title;

    const 
    viewContainer = document.createElement("DIV");
    viewContainer.setAttribute("class", "table-card");
    viewContainer.appendChild(viewTitle);
    viewContainer.appendChild(createTable(fieldTableData));
    viewContainer.appendChild(createTable(constraintTableData));

    // - Attach view container to the root elem
    root.appendChild(viewContainer);
}

/**
 * Creates an table element with attributes and
 * functionality that is passed in the input tableData
 * 
 * @param  {object}     tableData
 * @return {DOMElement} table 
 */
function createTable(tableData)
{
    const
    tbody = document.createElement("TBODY");
    tbody.setAttribute("id", tableData.tbody.id);

    for (const row of tableData.tbody.trList)
        tbody.appendChild(createDataRow(row));

    const 
    thead = document.createElement("THEAD");
    thead.setAttribute("id", tableData.thead.id);
    thead.appendChild(createHeaderRow(tableData.thead.tr, tbody));

    const 
    table = document.createElement("TABLE");
    table.setAttribute("class", "table-view");
    table.setAttribute("id", tableData.id);    
    table.appendChild(thead);
    table.appendChild(tbody);

    return table;
}


/**
 * Creates an text input wrapped in a TD
 * 
 * @param  {string}     key
 * @return {DOMElement} td 
 */
function createTdInput(key)
{
    const 
    input = document.createElement("INPUT");
    input.setAttribute("type", "text");
    input.setAttribute("value", key);    
    input.setAttribute("name",  key);

    const 
    td = document.createElement("TD");
    td.appendChild(input);

    return td;
}
/**
 * Creates a select wrapped in a TD
 * 
 * @param  {array}      values
 * @param  {string}     name
 * @return {DOMElement} td 
 */
function createTdSelect(values, name)
{
    const
    select = document.createElement("SELECT");
    select.setAttribute("name", name);

    for (const value of values)
    {
        const option = document.createElement("OPTION");
        option.setAttribute("value", value);
        option.innerHTML = value;
        select.appendChild(option);
    }

    const 
    td = document.createElement("TD");
    td.appendChild(select);

    return td;
}

/**
 * Creates a textnode wrapped in TH element
 * 
 * @param  {string}     text
 * @return {DOMElement} th
 */
function createThText(text)
{
    const 
    th = document.createElement("TH");
    th.innerHTML = text;
    return th;
}

/**
 * Creates a textnode wrapped in TD element
 * 
 * @param  {string}     text
 * @return {DOMElement} td
 */
function createTdText(text)
{
    const 
    td = document.createElement("TD");
    td.innerHTML = text;
    return td;
}

/**
 * Creates a textnode wrapped in BUTTON element
 * 
 * @param  {string}     text
 * @return {DOMElement} button
 */
function createButton(cls)
{
    const 
    button = document.createElement("BUTTON");
    button.setAttribute("class", cls);
    button.innerHTML = "x";

    return button;
}

/**
 * Creates a table header row
 * First three TDs are populated with a string from 'data'
 * The fourth one houses a button element.
 * Button element gets a click listener with a callback
 * which appends a new row in 'tbody'
 * 
 * @param  {array}      data 
 * @param  {DOMElement} tbody
 * @return {DOMElement} tr 
 */
function createHeaderRow(data, tbody)
{
    const 
    btn = createButton("btn-create");
    btn.innerHTML = "new";
    btn.addEventListener("click", (e) => {
        tbody.appendChild(createEditorRow(data, tbody));
    })

    const 
    td = document.createElement("TD");
    td.setAttribute("class", "btn-col");
    td.appendChild(btn);

    const 
    tr = document.createElement("TR");
    tr.setAttribute("class", "row");
    for (const text of data)
        tr.appendChild(createThText(text));

    tr.appendChild(td);

    return tr;
}

/**
 * Checks if array of strings contains only
 * Strings with some data
 * 
 * @param  {array}   data
 * @return {boolean} validity
 */
function isValidDataRowParam(data)
{
    let validity = true;

    for (const text of data)
        validity &= text.length > 0;

    return validity;
}

/**
 * Creates a table body row with static content
 * First three TDs are populated with a string from 'data'
 * The fourth one houses a button element.
 * Button element gets a click listener with a callback
 * which removes this row
 * 
 * @param  {array}      data 
 * @return {DOMElement} tr 
 */
function createDataRow(data)
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
function createEditorRow(data, tbody)
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


export 
{
    createApiTreeView,
    createNewApiTreeView,
    appendTreeViewEntryItem,
    solidifyTreeViewItem,
    createTableView,
    createTreeItem,
    Api,
    Table,
    Field,
    Constraint,
    C,
    TYPE
} 