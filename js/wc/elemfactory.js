
/**
 * Creates a HTMLElement with id and class attrs and a inner Text node
 * 
 * @param  {string}      tag 
 * @param  {string}      id 
 * @param  {string}      cls 
 * @param  {string}      html
 * @return {HTMLElement} 
 */
function newTagIdClassHTML(tag, id, cls, html)
{
    const
    elem = newTagIdClass(tag, id, cls);
    elem.innerHTML = html;

    return elem;
}

/**
 * Creates a HTMLElement with class attribute and a inner Text node
 * 
 * @param  {string}      tag 
 * @param  {string}      cls 
 * @param  {string}      html
 * @return {HTMLElement} 
 */
function newTagClassHTML(tag, cls, html)
{
    const
    elem = newTagClass(tag, cls);
    elem.innerHTML = html;

    return elem;
}

/**
 * Creates a HTMLElement with class attribute,
 * a inner Text node and a child element
 * 
 * @param  {string}      tag 
 * @param  {string}      cls 
 * @param  {string}      html
 * @param  {HTMLElement} child
 * @return {HTMLElement} 
 */
function newTagClassHTMLChild(tag, cls, html, child)
{
    const
    elem = newTagClassHTML(tag, cls, html);
    elem.appendChild(child);

    return elem;
}

/**
 * Creates an HTMLElement with id and class attrs and child elements
 * 
 * @param  {string}      tag 
 * @param  {string}      id 
 * @param  {string}      cls 
 * @param  {array}       children 
 * @return {HTMLElement} 
 */
function newTagIdClassChildren(tag, id, cls, children)
{
    const elem = newTagIdClass(tag, id, cls);

    for (const child of children)
    {
        elem.appendChild(child);
    }

    return elem;
}

/**
 * Creates an HTMLElement with  child elements
 * 
 * @param  {string}      tag 
 * @param  {string}      cls 
 * @param  {string}      html 
 * @param  {array}       children 
 * @return {HTMLElement} 
 */
function newTagClassHTMLChildren(tag, cls, html, children)
{
    const elem = newTagClassHTML(tag, cls, html);

    for (const child of children)
    {
        elem.appendChild(child);
    }

    return elem;
}

/**
 * Creates an HTMLElement with id and class attrs and child elements
 * 
 * @param  {string}      tag 
 * @param  {string}      id
 * @param  {string}      cls
 * @param  {string}      html 
 * @param  {array}       children 
 * @return {HTMLElement} 
 */
function newTagIdClassHTMLChildren(tag, id, cls, html, children)
{
    const elem = newTagIdClassHTML(tag, id, cls, html);

    for (const child of children)
    {
        elem.appendChild(child);
    }

    return elem;
}

/**
 * Creates a new HTMLElement with id and class attributes
 * 
 * @param  {string}      tag 
 * @param  {string}      id 
 * @param  {string}      cls
 * @return {HTMLElement} 
 */
function newTagIdClass(tag, id, cls)
{
    const
    elem = newTagId(tag, id);
    elem.setAttribute("class", cls);

    return elem;
}

/**
 * Creates a new HTMLElement with id attribute and Text node
 * 
 * @param  {string}      tag 
 * @param  {string}      id 
 * @param  {string}      html
 * @return {HTMLElement} 
 */
function newTagIdHTML(tag, id, html)
{
    const
    elem = newTagId(tag, id);
    elem.innerHTML = html;

    return elem;
}

/**
 * Creates a new HTMLElement with id attribute
 * 
 * @param  {string}      tag 
 * @param  {string}      id 
 * @return {HTMLElement} 
 */
function newTagId(tag, id)
{
    const
    elem = document.createElement(tag);
    elem.setAttribute("id", id);

    return elem;
}

/**
 * Creates a new HTMLElement with class attribute
 * 
 * @param  {string}      tag 
 * @param  {string}      cls
 * @return {HTMLElement} 
 */
function newTagClass(tag, cls)
{
    const
    elem = document.createElement(tag);
    elem.setAttribute("class", cls);

    return elem;
}

/**
 * Creates a new HTMLElement with a child element
 * 
 * @param  {string}      tag 
 * @param  {HTMLElement} child
 * @return {HTMLElement} 
 */
function newTagChild(tag, child)
{
    const 
    elem = document.createElement(tag);
    elem.appendChild(child);

    return elem;
}

/**
 * Creates a new HTMLElement with child elements
 * 
 * @param  {string}      tag 
 * @param  {array}       children
 * @return {HTMLElement} 
 */
function newTagChildren(tag, children)
{
    const elem = document.createElement(tag);

    for (const child of children)
    {
        elem.appendChild(child);
    }

    return elem;
}

/**
 * Creates a new HTMLElement with class attribute and a child element
 * 
 * @param  {string}      tag 
 * @param  {string}      cls
 * @param  {HTMLElement} child
 * @return {HTMLElement} 
 */
function newTagClassChild(tag, cls, child)
{
    const elem = newTagClass(tag, cls);

    elem.appendChild(child);

    return elem;
}

/**
 * Creates a new HTMLElement with id attribute and child elements
 * 
 * @param  {string}      tag
 * @param  {string}      id
 * @param  {array}       children
 * @return {HTMLElement} 
 */
function newTagIdChildren(tag, id, children)
{
    const elem = newTagId(tag, id);

    for (const child of children)
    {
        elem.appendChild(child);
    }

    return elem;
}

/**
 * Creates a new HTMLElement with class attribute and child elements
 * 
 * @param  {string}      tag
 * @param  {string}      class
 * @param  {array}       children
 * @return {HTMLElement} 
 */
function newTagClassChildren(tag, cls, children)
{
    const elem = newTagClass(tag, cls);

    for (const child of children)
    {
        elem.appendChild(child);
    }

    return elem;
}

/**
 * Creates a new HTMLElement with an inner Text node
 * 
 * @param  {string}      tag
 * @param  {string}      html
 * @return {HTMLElement} 
 */
function newTagHTML(tag, html)
{
    const elem = document.createElement(tag);
    elem.innerHTML = html;

    return elem;
}

/**
 * Creates a new HTMLElement
 * 
 * @param  {string}      tag
 * @return {HTMLElement} 
 */
function newTag(tag)
{
    return document.createElement(tag);
}

/**
 * Creates a new HTMLElement with user defined attributes
 * 
 * @param  {string}      tag
 * @param  {object}      attrs
 * @return {HTMLElement} 
 */
function newTagAttrs(tag, attrs, html = "")
{
    const elem = document.createElement(tag);

    for (const key in attrs)
    {
        elem.setAttribute(key, attrs[key]);
    }

    if (html.length)
    {
        elem.innerHTML = html;
    }

    return elem;
}

/**
 * Creates a new HTMLElement with class and user defined attributes
 * 
 * @param  {string}      tag
 * @param  {string}      id
 * @param  {object}      attrs
 * @return {HTMLElement} 
 */
function newTagIdAttrs(tag, id, attrs, html = "")
{
    const elem = newTagId(tag, id);

    for (const key in attrs)
    {
        elem.setAttribute(key, attrs[key]);
    }

    if (html.length)
    {
        elem.innerHTML = html;
    }

    return elem;
}

/**
 * Creates a new HTMLElement with class and user defined attributes
 * 
 * @param  {string}      tag
 * @param  {string}      cls
 * @param  {object}      attrs
 * @return {HTMLElement} 
 */
function newTagClassAttrs(tag, cls, attrs, html = "")
{
    const elem = newTagClass(tag, cls);

    for (const key in attrs)
    {
        elem.setAttribute(key, attrs[key]);
    }

    if (html.length)
    {
        elem.innerHTML = html;
    }

    return elem;
}

/**
 * Creates a new HTMLElement with class and user defined attributes
 * 
 * @param  {string}      tag
 * @param  {string}      id
 * @param  {string}      cls
 * @param  {object}      attrs
 * @return {HTMLElement} 
 */
function newTagIdClassAttrs(tag, id, cls, attrs, html = "")
{
    const elem = newTagIdClass(tag, id, cls);

    for (const key in attrs)
    {
        elem.setAttribute(key, attrs[key]);
    }

    if (html.length)
    {
        elem.innerHTML = html;
    }

    return elem;
}

/**
 * Creates a new HTMLElement with user defined attributes and child elements
 * 
 * @param  {string}      tag
 * @param  {object}      attrs
 * @param  {array}       children
 * @return {HTMLElement} 
 */
function newTagAttrsChildren(tag, attrs, children)
{
    const elem = newTagAttrs(tag, attrs);

    for (const child of children)
    {
        elem.appendChild(child);
    }

    return elem;
}

/**
 * Creates a new HTMLElement with class and user defined attributes and child elements
 * 
 * @param  {string}      tag
 * @param  {object}      attrs
 * @param  {array}       children
 * @return {HTMLElement} 
 */
function newTagClassAttrsChildren(tag, cls, attrs, children)
{
    const elem = newTagClassAttrs(tag, cls, attrs);

    for (const child of children)
    {
        elem.appendChild(child);
    }

    return elem;
}

/**
 * Creates a new HTMLElement with user defined attributes and inner Text node
 * 
 * @param  {string}      tag
 * @param  {object}      attrs
 * @param  {string}      html
 * @return {HTMLElement} 
 */
function newTagAttrsHTML(tag, attrs, html)
{
    return newTagAttrs(tag, attrs, html);
}


/**
 * Creates an array of new HTML elements with attributes
 * 
 * @param  {}
 * @param  {array} childList
 * @return
 */
function newTagAttrsChildList(tag, attrs, childList)
{
    const elemList = [];

    for (const child of childList)
    {
        const html = child.hasOwnProperty('html') ? child.html : "";
        elemList.push(newTagAttrs(child.tag, child.attrs, html));
    }

    return newTagAttrsChildren(tag, attrs, elemList);
}



/**
 * Creates an HTMLInputElement (type: text) with class attribute and value
 * 
 * @param  {string} cls 
 * @param  {string} val
 * @return {HTMLInputElement}
 */
function inputClassValue(cls, val)
{
    const
    elem = document.createElement("INPUT");
    elem.setAttribute("type", "text");
    elem.setAttribute("class", cls);
    elem.value = val;

    return elem;    
}

/**
 * Creates an HTMLInputElement (type: text) with class and name attributes
 * 
 * @param  {string} cls 
 * @return {HTMLInputElement}
 */
function inputClassName(cls)
{
    const
    elem = document.createElement("INPUT");
    elem.setAttribute("type", "text");
    elem.setAttribute("class", cls);

    return elem;    
}

/**
 * Creates an HTMLInputElement (type: text) with class attribute
 * 
 * @param  {string} cls 
 * @return {HTMLInputElement}
 */
function inputClassId(cls, id)
{
    const
    elem = document.createElement("INPUT");
    elem.setAttribute("type", "text");
    elem.setAttribute("class", cls);
    elem.setAttribute("id", id);

    return elem;    
}

/**
 * Creates a Input Number Element with min|max|defaultValue
 * 
 * @param  {number}           min 
 * @param  {number}           max 
 * @param  {number}           defaultValue
 * @return {HTMLImageElement} 
 */
function numberInputMinMaxDefault(min, max, defaultValue)
{
    const
    elem = document.createElement("INPUT");
    elem.setAttribute("type", "number");
    elem.min = min;
    elem.max = max;
    elem.defaultValue = defaultValue;

    return elem;
}

/**
 * Creates a Checkbox Input Element with class
 * 
 * @param  {string}           cls 
 * @param  {object}           attrs
 * @return {HTMLInputElement} 
 */
function checkboxClass(cls, isChecked = false, attrs = {})
{
    const
    elem = document.createElement("INPUT");
    elem.setAttribute("type",  "checkbox");
    elem.setAttribute("class", cls);

    if (isChecked) elem.checked = true;
    
    for (const key in attrs)
    {
        elem.setAttribute(key, attrs[key]);
    }

    return elem;
}

/**
 * Creates a HTMLSelectElement with class and id attrs and a list of options
 * 
 * @param  {string}            cls 
 * @param  {string}            id 
 * @param  {array}             list
 * @return {HTMLSelectElement} 
 */
function selectClassIdOptionList(cls, id, list)
{
    const
    select = document.createElement("SELECT");
    select.setAttribute("class", cls);
    
    if (id) select.setAttribute("id", id);

    for (const item of list)
        select.appendChild(optionValueHTML(item));

    return select;
}

/**
 * Creates a HTMLOptionElement with value and text
 * 
 * @param  {string}            value
 * @return {HTMLOptionElement} 
 */
function optionValueHTML(value)
{
    const
    elem = document.createElement("OPTION");
    elem.setAttribute("value", value);
    elem.innerHTML = value;

    return elem;
}


/**
 * Deletes all child elements of the input elem
 * 
 * @param {HTMLElement} elem 
 */
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
    newTagChild,
    newTagChildren,
    newTagClassHTML,
    newTagIdClassHTML,
    newTagClassChild,
    newTagIdChildren,
    newTagClassChildren,
    newTagClassHTMLChild,
    newTagIdClassChildren,
    newTagClassHTMLChildren,
    newTagIdClassHTMLChildren,
    newTagAttrs,
    newTagIdAttrs,
    newTagAttrsHTML,
    newTagClassAttrs,
    newTagIdClassAttrs,
    newTagAttrsChildren,
    newTagAttrsChildList,
    newTagClassAttrsChildren,
    inputClassValue,
    inputClassName,
    inputClassId,
    selectClassIdOptionList,
    numberInputMinMaxDefault,
    checkboxClass,
    deleteChildren
}