import 
{ 
    newTagClassChild, 
    newTagClassHTML 
} 
from "./elemfactory";

import
{
    EditableTextField,
    EditableNumberField,
    EditableSelectField,
    EditableCheckboxField
}
from "./wc";

import
{
    Field
}
from "../dbelems/Field";

/**
 * Extended tr element, which houses a data of a relational database
 * field information
 * Has two states:
 * 1) editable
 * 2) solid
 * @emits   solidify-field
 * Transmits:
 * 1) row index {integer}
 * 2) field info {Field} '/dbelems/Field.js'
 * 
 */
class FieldRow extends HTMLTableRowElement
{
    /**
     * 
     * @param  {Field}   field
     * @param  {integer} index 
     * @param  {object}  options 
     */
    constructor(field, index, options)
    {
        super();
        
        // -----------------------------------------------
        // - Setup member properties
        // -----------------------------------------------
        
        this._index    = index;
        this._editable = options.hasOwnProperty( 'editable' ) ? options.editable : false; 

        // -----------------------------------------------
        // - Setup the field map
        // -----------------------------------------------
        let fieldKey     = '';
        let fieldType    = 'BIT';
        let fieldSize    = 0;
        let fieldNotnull = false;
        let fieldDefault = '';
        let fieldAutoinc = 0;

        if (field instanceof Field)
        {
            fieldKey     = field.title;
            fieldType    = field.type;
            fieldSize    = field.size;
            fieldNotnull = field.notnull;
            fieldDefault = field.defaultValue;
            fieldAutoinc = field.autoinc;
        }

        const typeOptionList = 
        [
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
            "DATETIME",
            "TIMESTAMP",
            "LONGTEXT",
            "VARBINARY",  
            "MEDIUMTEXT"
        ];

        const typeEvent = { title: 'field-type', index: index };
        
        this._fieldMap =
        {
            key:          new EditableTextField(fieldKey, index, options),
            type:         new EditableSelectField(typeOptionList, typeEvent, options, fieldType),
            size:         new EditableNumberField(fieldSize, index, options),
            notnull:      new EditableCheckboxField(fieldNotnull, index, options),
            defaultValue: new EditableTextField(fieldDefault, index, options),
            autoinc:      new EditableNumberField(fieldAutoinc, index, options)
        };                       
                
        this.setAttribute('field-row', index);
        this.build();
    }

    /**
     * Builds the table divs with the editable field elements
     * And the button that toggles the editmode
     */
    build()
    {
        const 
        button = newTagClassHTML("button", "table__button", "e");
        button.addEventListener("click", e => {
            this.toggleMode();
        });

        this.appendChild(newTagClassChild("td", "field__key",     this._fieldMap['key']));
        this.appendChild(newTagClassChild("td", "field__type",    this._fieldMap['type']));
        this.appendChild(newTagClassChild("td", "field__size",    this._fieldMap['size']));
        this.appendChild(newTagClassChild("td", "field__notnull", this._fieldMap['notnull']));
        this.appendChild(newTagClassChild("td", "field__default", this._fieldMap['defaultValue']));
        this.appendChild(newTagClassChild("td", "field__autoinc", this._fieldMap['autoinc']));
        this.appendChild(newTagClassChild("td", "table__button",  button));

    }

    toggleMode()
    {
        if (this._editable)
        {
            this.setStaticMode();
        }
        else
        {
            this.setEditMode();
        }

    }


    setEditMode()
    {
        if ( ! this._editable)
        {
            for (const key in this._fieldMap)
            {
                this._fieldMap[key].setEditMode();
            }

            this._editable = true;
            this.emitModeEvent();
        }
    }

    setStaticMode()
    {
        if (this._editable)
        {
            for (const key in this._fieldMap)
            {
                this._fieldMap[key].setStaticMode();
            }

            this._editable = false;
            this.emitCreateFieldEvent();
        }
    }

    emitModeEvent()
    {
        this.dispatchEvent(new CustomEvent("field-row-mode", { detail: { index: this.index, mode: this.editable }}));
    }

    emitCreateFieldEvent()
    {
        this.dispatchEvent(new CustomEvent("solidify-field", { detail: { index: this.index, field: this.field }}));
    }

    get index()
    {
        return this._index;
    }

    get editable()
    {
        return this._editable;
    }

    // ---------------------------------------
    // -
    // - The field value getters and setters
    // -
    // ---------------------------------------

    get key()
    {
        return this._fieldMap['key'].content;
    }

    get type()
    {
        return this._fieldMap['type'].content;
    }

    get size()
    {
        return this._fieldMap['size'].content;
    }

    get notnull()
    {
        return this._fieldMap['notnull'].content;
    }

    get defaultValue()
    {
        return this._fieldMap['defaultValue'].content;
    }

    get autoinc()
    {
        return this._fieldMap['autoinc'].content;
    }

    get field()
    {
        let field = null;

        if (this.key.length)
        {
            field = new Field
            (
                this.key,
                this.type,
                this.size,
                this.notnull,
                this.defaultValue,
                this.autoinc
            );
        }

        return field;
    }
}

window.customElements.define('field-row', FieldRow, { extends: 'tr' });

export { FieldRow, Field }