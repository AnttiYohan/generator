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

class TreeView
{
    constructor(title, parent)
    {
        this._title    = title;
        this._parent   = parent;
        this._titleDiv = null;
        this._titleH4  = null;
        this._titleBtn = null;
        this._elemUl   = null;
        this._itemCb   = null;
        this.itemList  = [];
        this._state    = "table";
        this.
        _hasEditableItem = false;
    }

    // ----------------------
    // Accessor methods
    // ----------------------
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

    get state()
    {
        return this._state;
    }

    set state(value)
    {
        this._state = value;
    }

    addItem(item)
    {
        this.itemList.push(item);
    }

    clearItems()
    {
        this.itemList = [];
    }

    loadItems(list)
    {
        this.clearItems();
        for (const item of list)
            this.addItem(item);
    }

    item(index)
    {
        return this.itemList(index);
    }

    refresh(title, itemList, itemCb)
    {
        deleteChildren(this._parent);
        this._title = title;
        this.loadItems(itemList);
        this.buildUl(itemCb);
        this.buildTitle();
        this.render();
    }

    // ----------------------------------------- //
    // - Dynamic HTMLElement Generator Methods - //
    // ----------------------------------------- // 

    render()
    {
        this._parent.appendChild(this._titleDiv);
        this._parent.appendChild(this._elemUl);
    }

    appendTo(root)
    {
        root.appendChild(this._titleDiv);
        root.appendChild(this._elemUl);
    }


    buildTitle()
    {
        this._titleH4  = newTagHTML("h4", this._title);
        this._titleBtn = newTagIdClassHTML("div", "new-" + this._state, "tool-item", "+");

        this._titleBtn.addEventListener("click", () => 
        {
            if (!this._hasEditableItem) this.addEditableItem();
        });

        this._titleDiv = newTagIdClass("div", "tree-title", "title-tool-hbox");
        this._titleDiv.appendChild(this._titleH4);
        this._titleDiv.appendChild(this._titleBtn);        
    }

    buildUl(itemCb)
    {
        this._itemCb = itemCb;
        this._elemUl = newTagIdClass("ul", "tree-root", "tree-list");
        for (const item of this.itemList)
            this._elemUl.appendChild(TreeView.createLi(item, itemCb));
    }

    addEditableItem()
    {
        // - Set title button as disabled
        this._hasEditableItem = true;
        this._titleBtn.classList.add("disabled");
        const li     = newTagClass("li", "tree-item title-tool-hbox");
        const input  = inputClassName("tree-item-input", "new-table-input");
        const button = newTagClassHTML("button", "tool-item", "ok");
        button.addEventListener("click", () =>
        {
            if (input.value.length)
                this.solidifyEditableItem(li, input.value);
            else
                li.remove();

            this._hasEditableItem = false;
        });
    
        li.appendChild(input);
        li.appendChild(button);
        this._elemUl.appendChild(li);
    }

    solidifyEditableItem(li, title)
    {
        deleteChildren(li);
        li.innerHTML = title;
        li.addEventListener("click", () => { this._itemCb(title); });
    }

    // ----------------------------------------- //
    // - Static HTMLElement Generator Methods  - //
    // ----------------------------------------- //

    static apiDetailsInto(root, title, titleCb, itemList)
    {
        root.appendChild(TreeView.createTitle(title, "table", titleCb));
        root.appendChild(TreeView.createUl(itemList));    
    }

    static createTitle(title, idPostfix, ul, itemCb)
    {
        const h4  = newTagHTML("h4", title);
        const div = newTagIdClassHTML("div", "new-" + idPostfix, "tool-item", "+");

        div.addEventListener("click", () => 
        {
            TreeView.appendLiInput(ul, itemCb);
        });

        const 
        container = newTagIdClass("div", "tree-title", "title-tool-hbox");
        container.appendChild(h4);
        container.appendChild(div);

        return container;
    }

    static createUl(itemList)
    {
        const ul = newTagIdClass("ul", "tree-root", "tree-list");
        for (const item of itemList)
            ul.appendChild(TreeView.createLi(item.title, item.cb));
    
        return ul;
    }

    static createLi(title, cb = null)
    {
        const li = newTagClassHTML("li", "tree-item", title);
        
        if (cb) li.addEventListener("click", () => { cb(title); });

        return li;
    }

    static createLiInput(cb)
    {
        const li     = newTagClass("li", "tree-item title-tool-hbox");
        const input  = inputClassName("tree-item-input", "new-table-input");
        const button = newTagClassHTML("button", "tool-item", "ok");
        button.addEventListener("click", () =>
        {
            cb(li, input.value);
        });
    
        li.appendChild(input);
        li.appendChild(button);
    
        return li;
    }

    static appendLiInput(ul, cb)
    {
        ul.appendChild(TreeView.createLiInput(cb));
    }

    static solidifyItem(li, title, cb)
    {
        deleteChildren(li);
        li.innerHTML = title;
        li.addEventListener("click", () => { cb(title); });
    }    
}

export { TreeView }