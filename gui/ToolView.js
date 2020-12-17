import
{
    newTag,
    newTagId,
    newTagClass,
    newTagIdClass,
    newTagHTML,
    inputClassName,
    newTagClassHTML
}
from "./elemfactory";

class ToolView
{
    constructor(title)
    {
        this._title = title;
        this.itemList = [];
    }

    // ----------------------
    // Accessor methods
    // ----------------------
    get title()      { return this._title;   }
    set title(value) { this._title = value;  }

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
        for (item of list)
            this.addItem(item);
    }

    item(index)
    {
        return this.itemList(index);
    }

    // -------------------------------
    // - HTMLElement Generator Methods
    // -------------------------------

    static createItem(text, id, cb = null)
    {
        const          div = newTagClassHTML("div", "tool-item", text);
        if (id.length) div.setAttribute("id", id);
        if (cb)        div.addEventListener("click", () => { cb; });

        return div;
    }

    static createBar(items)
    {
        const div = newTagIdClass("div", "tools", "toolbar");

        for (const item of items)
        {
            div.appendChild(
                ToolView.createItem(item.text, item.id, item.cb)
            );
        }

        return div;
    }

}

export { ToolView }