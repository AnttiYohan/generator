import
{
    Api,
    Table,
    Field,
    Constraint,
    Check,
    NotNull,
    ForeignKey,
    PrimaryKey,
    AutoIncrement,
    Type,
    Action, 
    Reference,
}
from "./dbelems/Api";

import { TableView, ToolBar, ToolItem, ApiView, LoginView } from "./wc/wc";

import { ApigenRequest } from "./ApigenRequest";

import { Store } from "./LocalStorageManager";

// - Create map for API container
var apiMap = {};
let currentUser = {username : "Antti", user_id : 1, email: "antti@prototyper.tech"};



/**
 * Build the Apigen UI
 * 1) Setup the header with toolbar and signing 
 * 2) Setup treeview to navigate the API's and
 * 3) Setup tableview to edit API tables, models, data, settings amd stats
 * 4) Setup the footer
 * 
 * :---------------------------------------------------------:
 * | Toolbar                                  login/logout   |
 * |--------------;------------------------------------------|
 * | TreeView     |  TableView    Table 1                    |
 * |--------------|------------------------------------------|
 * | <- All APIs  | name   | type       | constraint         | 
 * |--------------|------------------------------------------|
 * | API Name | + | id       INT          AUTO_INCREMENT 1   |   
 * |--------------|                       PRIMARY_KEY        |
 * | Table 1    > |------------------------------------------|
 * | ...          | name     VARCHAR  64  NOT_NULL           |
 * | Table n      |------------------------------------------|
 * |--------------| author   INT          NOT_NULL           |
 * | Model 1      |------------------------------------------|
 * | ...          | CONSTRAINTS:                             |
 * | Model n      | FOREIGN KEY (author) REFERENCES Table2.id|
 * |--------------|                      ON UPDATE CASCADE   |
 * | Run          |                      ON DELETE CASCADE   |
 * '--------------'------------------------------------------'
 * |                                                         |
 * | Footer                                                  |
 * |_________________________________________________________|
 */

function setupToolbar()
{
    const header    = document.querySelector("header");

    const toolItemNewApi  = new ToolItem("New");
    const toolItemOpenApi = new ToolItem("Open", "100px");
    const toolItemSaveApi = new ToolItem("Save", "100px");
    const toolItemLogin   = new ToolItem("Login");

    //toolbar.appendChild(tiOpenApi); 
    header.appendChild
    (
        new ToolBar
        ([
            toolItemNewApi,
            toolItemOpenApi,
            toolItemSaveApi,
            toolItemLogin
            //new EditableField("frontface", 1, { width: "150px", height: "32px"})
        ]) 
    );

}

(function setupTreeview()
{
    //let user = Store.readUser();
    //let list = Store.readApiList();
    //let obj  = Store.readApi("testapi");

    let storeObj = Store.readApi("33");
    let storeApi = null;

    if (storeObj !== null)
    {
        storeApi = new Api(storeObj._name);

        for (const table of storeObj._tableList);
        {
            const table = new Table(table._name);

            storeApi.addTable(table);
        }
    }

    /*window.addEventListener("login-event", e => {
        console.log(e.detail.auth);
        const auth = e.detail.auth;

        if ('user_id' in auth)
        {
            if (Number.isInteger(auth.user_id))
            {
                deleteChildren(m);
                m.appendChild(treeView);
                m.appendChild(tableView);
                
                treeView.openWithEmpty(auth);
            }
        }
    }, true); */ 


    setupToolbar();

    const apiView = new ApiView();
    const tableView = new TableView();
    //const loginView = new LoginView();

    const m = document.getElementById("main-content");
    m.appendChild(apiView);
    m.appendChild(tableView);
    //m.appendChild(loginView);
    
    /*
    if (storeApi !== null) treeView.openWithApi(storeApi);
    else
        treeView.openWithEmpty(currentUser);*/

  
})();

function createApiMap(data)
{
    for (const key in data)
    {
        const api = data[key];
        apiMap[key] = Api.createFromJson(api);
    }
}

/*
// - Create APIs here to mockup the data
const protoApi = new Api("Prototyper");

let t1 = 
new Table
(
    "Users",
    [
        new Field
        (
            "id", 
            Type.index("INTEGER"), 
            0,
            [
                new NotNull("id"),
                new AutoIncrement("id")
            ]
        ),
        new Field
        (
            "name", 
            Type.index("VARCHAR"), 
            128, 
            [
                new NotNull("name")
            ]
        ),
        new Field
        (
            "email", 
            Type.index("INTEGER"), 
            128,
            [
                new NotNull("email")
            ]
        ),
        new Field
        (
            "password", 
            Type.index("VARCHAR"), 
            64,
            [
                new NotNull("password")
            ]
        )
    ],
    [
        new PrimaryKey("Users", ["id"])
    ]
);
let t2 = 
new Table
(
    "Projects",
    [
        new Field("id", Type.index("INTEGER"), 0, [new NotNull(), new AutoIncrement()]),
        new Field("name", Type.index("VARCHAR"), 128, [new NotNull()]),
        new Field("author", Type.index("INTEGER"), 0, [new NotNull()])
    ],
    [
        new PrimaryKey("Projects", ["id"]),
        new ForeignKey
        (
            "author",
            new Reference("Users", "id"),
            new Action("CASCADE"),
            new Action("CASCADE")
        )
    ]
);

protoApi.loadTables([t1, t2]);

const myAPI = new Api("MyAPI");

let t3 = 
new Table
(
    "Users",
    [
        new Field("id", Type.index("INTEGER"), 0, new AutoIncrement()),
        new Field("name", Type.index("VARCHAR"), 64, new NotNull()),
        new Field("email", Type.index("VARCHAR"), 128, new NotNull()),
        new Field("password", Type.index("VARCHAR"), 64, new NotNull())
    ],
    [
        new PrimaryKey("Users", ["id"])
    ]
);
myAPI.addTable(t3);
apiMap[protoApi.title] = protoApi;
apiMap[myAPI.title]    = myAPI;

*/