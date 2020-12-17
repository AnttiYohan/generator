function newTagIdClassHTML(tag, id, cls, html)
{
    const
    elem = document.createElement(tag);
    elem.setAttribute("id", id);
    elem.setAttribute("class", cls);
    elem.innerHTML = html;

    return elem;
}

function newTagClassHTML(tag, cls, html)
{
    const
    elem = document.createElement(tag);
    elem.setAttribute("class", cls);
    elem.innerHTML = html;

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

function newTagIdHTML(tag, id, html)
{
    const
    elem = document.createElement(tag);
    elem.setAttribute("id", id);
    elem.innerHTML = html;

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

function inputClassName(cls, name)
{
    const
    elem = document.createElement("INPUT");
    elem.setAttribute("type", "text");
    elem.setAttribute("name",  name);
    elem.setAttribute("class", cls);

    return elem;    
}

function selectClassIdOptionList(cls, id, list)
{
    const
    select = document.createElement("SELECT");
    select.setAttribute("class", cls);
    select.setAttribute("id", id);

    for (const item of list)
        select.appendChild(optionValueHTML(item));

    return select;
}

function optionValueHTML(value)
{
    const
    elem = documemt.createElement("OPTION");
    elem.setAttribute("value", value);
    elem.innerHTML = value;

    return elem;
}

function deleteChildren(elem)
{  
    while (elem.firstChild) elem.removeChild(elem.lastChild);
}

export
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
    selectClassIdOptionList,
    deleteChildren
}